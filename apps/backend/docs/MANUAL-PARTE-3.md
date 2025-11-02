# MANUAL TÉCNICO COMPLETO - CERMONT ATG BACKEND
## PARTE 3/3: Integraciones y Anexos

---

## ÍNDICE GENERAL

### Parte 3: Integraciones y Anexos
19. [Integraciones](#19-integraciones)
20. [Extensiones Futuras](#20-extensiones-futuras)
21. [Glosario](#21-glosario)
22. [Referencias](#22-referencias)
23. [Anexos](#23-anexos)
24. [Control de Cambios](#24-control-de-cambios)
25. [Licencia](#25-licencia)

---

## 19. INTEGRACIONES

### 19.1 Arquitectura de Integraciones

#### Patrón de Adaptador para Integraciones
```javascript
/**
 * Patrón de adaptador base para integraciones externas
 */
class IntegrationAdapter {
  constructor(config) {
    this.config = config;
    this.logger = logger.child({ integration: this.constructor.name });
  }

  /**
   * Inicializar la integración
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Verificar estado de la integración
   */
  async healthCheck() {
    throw new Error('healthCheck() must be implemented by subclass');
  }

  /**
   * Manejar errores de integración
   */
  handleError(error, context) {
    this.logger.error('Integration error:', {
      error: error.message,
      stack: error.stack,
      context
    });

    // Implementar lógica de retry o fallback
  }

  /**
   * Limpiar recursos
   */
  async cleanup() {
    // Implementación por defecto vacía
  }
}

/**
 * Registry de integraciones
 */
class IntegrationRegistry {
  constructor() {
    this.integrations = new Map();
  }

  register(name, adapter) {
    this.integrations.set(name, adapter);
  }

  get(name) {
    return this.integrations.get(name);
  }

  async initializeAll() {
    for (const [name, adapter] of this.integrations) {
      try {
        await adapter.initialize();
        logger.info(`Integration initialized: ${name}`);
      } catch (error) {
        logger.error(`Failed to initialize integration: ${name}`, error);
      }
    }
  }

  async healthCheckAll() {
    const results = {};
    for (const [name, adapter] of this.integrations) {
      try {
        results[name] = await adapter.healthCheck();
      } catch (error) {
        results[name] = { status: 'error', error: error.message };
      }
    }
    return results;
  }
}

export const integrationRegistry = new IntegrationRegistry();
```

### 19.2 Integración con SAP

#### SAP Adapter Implementation
```javascript
/**
 * Adaptador para integración con SAP
 */
class SAPAdapter extends IntegrationAdapter {
  constructor(config) {
    super(config);
    this.client = null;
    this.connected = false;
  }

  async initialize() {
    try {
      // Configurar conexión SAP (usando sapnwrfc o similar)
      this.client = new sap.Client({
        host: this.config.host,
        port: this.config.port,
        client: this.config.client,
        user: this.config.username,
        password: this.config.password,
        lang: 'ES'
      });

      await this.client.connect();
      this.connected = true;

      this.logger.info('SAP integration initialized successfully');
    } catch (error) {
      this.handleError(error, 'initialization');
      throw error;
    }
  }

  async healthCheck() {
    try {
      if (!this.connected) {
        return { status: 'disconnected' };
      }

      // Ejecutar función RFC de prueba
      const result = await this.client.call('RFC_PING');
      
      return {
        status: 'healthy',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Crear orden de trabajo en SAP
   */
  async createWorkOrder(orderData) {
    try {
      const sapOrder = this.mapOrderToSAP(orderData);
      
      const result = await this.client.call('BAPI_ALM_ORDER_MAINTAIN', {
        IT_METHODS: [{
          METHOD: 'CREATE',
          OBJECTTYPE: 'ORDER'
        }],
        IT_HEADER: [sapOrder.header],
        IT_OPERATION: sapOrder.operations
      });

      return {
        sapOrderId: result.ET_NUMBERS[0].NUMBER,
        success: true
      };
    } catch (error) {
      this.handleError(error, { action: 'createWorkOrder', orderData });
      throw new AppError('Error creando orden en SAP', 500, error.message);
    }
  }

  /**
   * Actualizar estado de orden en SAP
   */
  async updateOrderStatus(orderId, status) {
    try {
      const sapStatus = this.mapStatusToSAP(status);
      
      await this.client.call('BAPI_ALM_ORDER_MAINTAIN', {
        IT_METHODS: [{
          METHOD: 'CHANGE',
          OBJECTTYPE: 'ORDER',
          OBJECTKEY: orderId
        }],
        IT_HEADER: [{
          ORDERID: orderId,
          ORDER_STATUS: sapStatus
        }]
      });

      return { success: true };
    } catch (error) {
      this.handleError(error, { action: 'updateOrderStatus', orderId, status });
      throw new AppError('Error actualizando estado en SAP', 500, error.message);
    }
  }

  /**
   * Obtener datos maestros de SAP
   */
  async getMasterData(entity, filters = {}) {
    try {
      let functionName, parameters;

      switch (entity) {
        case 'equipment':
          functionName = 'BAPI_EQUI_GETLIST';
          parameters = {
            EQUIPMENT_LIST: [],
            ...filters
          };
          break;
        
        case 'materials':
          functionName = 'BAPI_MATERIAL_GETLIST';
          parameters = {
            MATERIAL_SHORT_DESC_SEL: [],
            ...filters
          };
          break;
        
        default:
          throw new Error(`Entity ${entity} not supported`);
      }

      const result = await this.client.call(functionName, parameters);
      return this.mapSAPResponse(result);
    } catch (error) {
      this.handleError(error, { action: 'getMasterData', entity, filters });
      throw new AppError(`Error obteniendo datos maestros de SAP: ${entity}`, 500, error.message);
    }
  }

  /**
   * Mapear orden de CERMONT a estructura SAP
   */
  mapOrderToSAP(orderData) {
    return {
      header: {
        ORDER_TYPE: 'PM01', // Preventive Maintenance
        PLANPLANT: orderData.plant || '1000',
        MN_WK_CTR: orderData.workCenter || 'MECH',
        PLANT: orderData.plant || '1000',
        LOCATION: orderData.location,
        SHORT_TEXT: orderData.description.substring(0, 40),
        PRIORITY: this.mapPriorityToSAP(orderData.priority),
        START_DATE: this.formatDateForSAP(orderData.fechaInicioEstimada),
        FINISH_DATE: this.formatDateForSAP(orderData.fechaFinEstimada)
      },
      operations: orderData.tasks?.map(task => ({
        ACTIVITY: task.activity || '0010',
        DESCRIPTION: task.description.substring(0, 40),
        WORK_CNTR: task.workCenter || 'MECH',
        PLANT: orderData.plant || '1000',
        DURATION: task.duration || 1,
        DURATION_UNIT: 'H'
      })) || []
    };
  }

  mapPriorityToSAP(priority) {
    const priorityMap = {
      'baja': '3',
      'media': '2', 
      'alta': '1',
      'urgente': '0'
    };
    return priorityMap[priority] || '2';
  }

  mapStatusToSAP(status) {
    const statusMap = {
      'pending': 'CRTD',
      'planning': 'PLAN',
      'in_progress': 'REL',
      'completed': 'CNF',
      'cancelled': 'CLSD'
    };
    return statusMap[status] || 'CRTD';
  }

  formatDateForSAP(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0].replace(/-/g, '');
  }

  mapSAPResponse(sapData) {
    // Implementar mapeo específico según respuesta SAP
    return sapData;
  }

  async cleanup() {
    if (this.client && this.connected) {
      await this.client.close();
      this.connected = false;
    }
  }
}

// Registrar integración SAP
integrationRegistry.register('sap', new SAPAdapter({
  host: process.env.SAP_HOST,
  port: process.env.SAP_PORT,
  client: process.env.SAP_CLIENT,
  username: process.env.SAP_USERNAME,
  password: process.env.SAP_PASSWORD
}));
```

#### SAP Integration Service
```javascript
/**
 * Servicio de integración con SAP
 */
class SAPIntegrationService {
  constructor(sapAdapter) {
    this.sapAdapter = sapAdapter;
    this.syncQueue = [];
    this.isProcessing = false;
  }

  /**
   * Sincronizar orden con SAP
   */
  async syncOrder(orderId) {
    try {
      const order = await Order.findById(orderId).populate('assignedTo');
      if (!order) {
        throw new AppError('Orden no encontrada', 404);
      }

      // Verificar si ya está sincronizada
      if (order.sapOrderId) {
        this.logger.info(`Order ${orderId} already synced with SAP: ${order.sapOrderId}`);
        return { alreadySynced: true, sapOrderId: order.sapOrderId };
      }

      // Crear orden en SAP
      const sapResult = await this.sapAdapter.createWorkOrder(order);

      // Actualizar orden local con ID de SAP
      order.sapOrderId = sapResult.sapOrderId;
      order.syncStatus = 'synced';
      order.lastSync = new Date();
      await order.save();

      // Auditar sincronización
      await createAuditLog({
        userId: null, // Sistema
        userEmail: 'system@cermont.com',
        action: 'SAP_SYNC',
        resource: 'Order',
        resourceId: orderId,
        description: `Orden sincronizada con SAP: ${sapResult.sapOrderId}`,
        status: 'SUCCESS',
        metadata: { sapOrderId: sapResult.sapOrderId }
      });

      this.logger.info(`Order ${orderId} synced with SAP: ${sapResult.sapOrderId}`);

      return {
        success: true,
        sapOrderId: sapResult.sapOrderId,
        localOrderId: orderId
      };
    } catch (error) {
      // Marcar como error de sincronización
      await Order.findByIdAndUpdate(orderId, {
        syncStatus: 'error',
        lastSync: new Date(),
        syncError: error.message
      });

      await createAuditLog({
        userId: null,
        userEmail: 'system@cermont.com',
        action: 'SAP_SYNC',
        resource: 'Order',
        resourceId: orderId,
        description: `Error sincronizando orden con SAP: ${error.message}`,
        status: 'FAILURE',
        errorMessage: error.message
      });

      throw error;
    }
  }

  /**
   * Sincronización en cola para evitar sobrecarga
   */
  async queueSync(orderId) {
    this.syncQueue.push(orderId);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.syncQueue.length > 0) {
      const orderId = this.syncQueue.shift();
      
      try {
        await this.syncOrder(orderId);
        // Esperar entre sincronizaciones para no sobrecargar SAP
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(`Failed to sync order ${orderId}:`, error);
        // Continuar con siguiente orden
      }
    }

    this.isProcessing = false;
  }

  /**
   * Sincronizar cambios de estado con SAP
   */
  async syncStatusChange(orderId, newStatus) {
    try {
      const order = await Order.findById(orderId);
      if (!order?.sapOrderId) {
        return; // No está sincronizada con SAP
      }

      await this.sapAdapter.updateOrderStatus(order.sapOrderId, newStatus);
      
      order.lastSync = new Date();
      await order.save();

      this.logger.info(`Order status ${orderId} synced to SAP: ${newStatus}`);
    } catch (error) {
      this.logger.error(`Failed to sync status change for order ${orderId}:`, error);
      // No lanzar error para no bloquear cambio local
    }
  }
}

export default new SAPIntegrationService(integrationRegistry.get('sap'));
```

### 19.3 Integración con Email

#### Email Service con Templates
```javascript
/**
 * Servicio de email avanzado con templates
 */
class EmailService extends IntegrationAdapter {
  constructor(config) {
    super(config);
    this.transporter = null;
    this.templates = new Map();
  }

  async initialize() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.username,
          pass: this.config.password
        },
        pool: true, // Usar pool de conexiones
        maxConnections: 5,
        maxMessages: 100
      });

      // Verificar conexión
      await this.transporter.verify();

      // Cargar templates
      await this.loadTemplates();

      this.logger.info('Email service initialized successfully');
    } catch (error) {
      this.handleError(error, 'initialization');
      throw error;
    }
  }

  async healthCheck() {
    try {
      await this.transporter.verify();
      return {
        status: 'healthy',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Cargar templates de email
   */
  async loadTemplates() {
    const templates = {
      'order-assigned': {
        subject: 'Nueva orden asignada - {{orderNumber}}',
        html: `
          <h2>Nueva Orden de Trabajo Asignada</h2>
          <p>Hola <strong>{{userName}}</strong>,</p>
          <p>Se te ha asignado la siguiente orden de trabajo:</p>
          <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0;">
            <h3>Orden #{{orderNumber}}</h3>
            <p><strong>Cliente:</strong> {{clientName}}</p>
            <p><strong>Descripción:</strong> {{description}}</p>
            <p><strong>Prioridad:</strong> {{priority}}</p>
            <p><strong>Fecha límite:</strong> {{dueDate}}</p>
          </div>
          <p>Puedes acceder a la orden desde el sistema: <a href="{{orderUrl}}">Ver Orden</a></p>
          <br>
          <p>Saludos,<br>Equipo CERMONT</p>
        `
      },
      'order-completed': {
        subject: 'Orden completada - {{orderNumber}}',
        html: `
          <h2>Orden Completada</h2>
          <p>La orden <strong>#{{orderNumber}}</strong> ha sido completada.</p>
          <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0;">
            <p><strong>Técnico:</strong> {{technicianName}}</p>
            <p><strong>Cliente:</strong> {{clientName}}</p>
            <p><strong>Fecha de finalización:</strong> {{completedDate}}</p>
          </div>
          <p>Para más detalles, accede al sistema: <a href="{{orderUrl}}">Ver Orden</a></p>
        `
      },
      'password-reset': {
        subject: 'Restablecimiento de contraseña',
        html: `
          <h2>Restablecimiento de Contraseña</h2>
          <p>Hola <strong>{{userName}}</strong>,</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
          </p>
          <p><strong>Este enlace expirará en 1 hora.</strong></p>
          <p>Si no solicitaste este cambio, ignora este mensaje.</p>
          <br>
          <p>Saludos,<br>Equipo CERMONT</p>
        `
      }
    };

    for (const [name, template] of Object.entries(templates)) {
      this.templates.set(name, template);
    }
  }

  /**
   * Enviar email usando template
   */
  async sendTemplate(templateName, to, data, options = {}) {
    try {
      const template = this.templates.get(templateName);
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const html = this.renderTemplate(template.html, data);
      const subject = this.renderTemplate(template.subject, data);

      await this.send({
        to,
        subject,
        html,
        ...options
      });

      this.logger.info(`Template email sent: ${templateName} to ${to}`);
    } catch (error) {
      this.handleError(error, { templateName, to, data });
      throw error;
    }
  }

  /**
   * Renderizar template con datos
   */
  renderTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  /**
   * Enviar email básico
   */
  async send(options) {
    try {
      const mailOptions = {
        from: this.config.from || 'noreply@cermont.com',
        ...options
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      this.logger.debug('Email sent:', info.messageId);
      
      return info;
    } catch (error) {
      this.handleError(error, { options });
      throw new AppError('Error enviando email', 500, error.message);
    }
  }

  /**
   * Enviar notificación de orden asignada
   */
  async notifyOrderAssigned(order, user) {
    const orderUrl = `${process.env.FRONTEND_URL}/orders/${order._id}`;
    
    await this.sendTemplate('order-assigned', user.email, {
      userName: user.nombre,
      orderNumber: order.numeroOrden,
      clientName: order.clienteNombre,
      description: order.descripcion,
      priority: this.translatePriority(order.prioridad),
      dueDate: order.fechaFinEstimada ? new Date(order.fechaFinEstimada).toLocaleDateString('es-CO') : 'No definida',
      orderUrl
    });
  }

  /**
   * Enviar notificación de orden completada
   */
  async notifyOrderCompleted(order, technician) {
    const orderUrl = `${process.env.FRONTEND_URL}/orders/${order._id}`;
    
    // Notificar al cliente si tiene email
    if (order.clienteEmail) {
      await this.sendTemplate('order-completed', order.clienteEmail, {
        orderNumber: order.numeroOrden,
        technicianName: technician.nombre,
        clientName: order.clienteNombre,
        completedDate: new Date().toLocaleDateString('es-CO'),
        orderUrl
      });
    }
  }

  translatePriority(priority) {
    const translations = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return translations[priority] || priority;
  }

  async cleanup() {
    if (this.transporter) {
      this.transporter.close();
    }
  }
}

// Registrar servicio de email
integrationRegistry.register('email', new EmailService({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  username: process.env.SMTP_USERNAME,
  password: process.env.SMTP_PASSWORD,
  from: process.env.SMTP_FROM
}));
```

### 19.4 Integración con WebSockets

#### WebSocket Service para Notificaciones
```javascript
/**
 * Servicio de WebSockets para notificaciones en tiempo real
 */
class WebSocketService extends IntegrationAdapter {
  constructor(config) {
    super(config);
    this.io = null;
    this.connectedClients = new Map();
    this.rooms = new Map();
  }

  async initialize() {
    try {
      // WebSocket ya está inicializado en server.js
      // Aquí solo configuramos el servicio
      this.logger.info('WebSocket service initialized');
    } catch (error) {
      this.handleError(error, 'initialization');
      throw error;
    }
  }

  setSocketIO(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      this.logger.info(`Client connected: ${socket.id}`);

      // Autenticar socket
      socket.on('authenticate', async (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.userId);

          if (user) {
            socket.userId = user._id;
            socket.userRole = user.rol;
            this.connectedClients.set(socket.id, user);

            // Unir a room de usuario
            socket.join(`user:${user._id}`);

            // Unir a room de rol
            socket.join(`role:${user.rol}`);

            socket.emit('authenticated', { success: true });
            this.logger.info(`Socket authenticated: ${socket.id} -> ${user.email}`);
          } else {
            socket.emit('authenticated', { success: false, error: 'Usuario no encontrado' });
          }
        } catch (error) {
          socket.emit('authenticated', { success: false, error: 'Token inválido' });
        }
      });

      // Unirse a room de orden
      socket.on('join-order', (orderId) => {
        if (socket.userId) {
          socket.join(`order:${orderId}`);
          this.logger.debug(`User ${socket.userId} joined order room: ${orderId}`);
        }
      });

      // Salir de room de orden
      socket.on('leave-order', (orderId) => {
        socket.leave(`order:${orderId}`);
        this.logger.debug(`User ${socket.userId} left order room: ${orderId}`);
      });

      // Manejar desconexión
      socket.on('disconnect', () => {
        this.connectedClients.delete(socket.id);
        this.logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Enviar notificación a usuario específico
   */
  notifyUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Enviar notificación a todos los usuarios de un rol
   */
  notifyRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Enviar notificación a todos los usuarios en una orden
   */
  notifyOrder(orderId, event, data) {
    this.io.to(`order:${orderId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast a todos los usuarios conectados
   */
  broadcast(event, data) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Obtener estadísticas de conexiones
   */
  getStats() {
    return {
      connectedClients: this.connectedClients.size,
      rooms: Array.from(this.io.sockets.adapter.rooms.keys()).length,
      timestamp: new Date().toISOString()
    };
  }

  async healthCheck() {
    return {
      status: this.io ? 'healthy' : 'disconnected',
      connectedClients: this.connectedClients.size,
      lastCheck: new Date().toISOString()
    };
  }
}

// Registrar servicio WebSocket
const wsService = new WebSocketService({});
integrationRegistry.register('websocket', wsService);

// Función para obtener instancia (se configura después)
export const getWebSocketService = () => integrationRegistry.get('websocket');
```

#### Integration con Order Service
```javascript
// En OrderService, agregar notificaciones WebSocket
export class OrderService {
  // ... métodos existentes ...

  async assignUsers(orderId, userIds, assignedBy) {
    // ... lógica existente ...

    // Notificar a usuarios asignados
    const wsService = getWebSocketService();
    for (const userId of userIds) {
      wsService.notifyUser(userId, 'order-assigned', {
        orderId,
        orderNumber: order.numeroOrden,
        assignedBy: assignedBy.nombre
      });

      // Enviar email también
      const user = await User.findById(userId);
      await emailService.notifyOrderAssigned(order, user);
    }

    return result;
  }

  async updateStatus(orderId, newStatus, updatedBy) {
    // ... lógica existente ...

    // Notificar cambio de estado
    const wsService = getWebSocketService();
    wsService.notifyOrder(orderId, 'order-status-changed', {
      orderId,
      newStatus,
      updatedBy: updatedBy.nombre,
      timestamp: new Date().toISOString()
    });

    // Sincronizar con SAP si está configurado
    if (process.env.SAP_INTEGRATION_ENABLED === 'true') {
      await sapIntegrationService.syncStatusChange(orderId, newStatus);
    }

    return result;
  }
}
```

### 19.5 Integración con Cloud Storage

#### Cloud Storage Adapter (AWS S3 / Google Cloud)
```javascript
/**
 * Adaptador para almacenamiento en la nube
 */
class CloudStorageAdapter extends IntegrationAdapter {
  constructor(config) {
    super(config);
    this.client = null;
    this.provider = config.provider || 'aws'; // aws, gcp, azure
  }

  async initialize() {
    try {
      switch (this.provider) {
        case 'aws':
          const { S3Client } = await import('@aws-sdk/client-s3');
          this.client = new S3Client({
            region: this.config.region,
            credentials: {
              accessKeyId: this.config.accessKeyId,
              secretAccessKey: this.config.secretAccessKey
            }
          });
          break;

        case 'gcp':
          // Configuración Google Cloud Storage
          break;

        case 'azure':
          // Configuración Azure Blob Storage
          break;
      }

      this.logger.info(`${this.provider.toUpperCase()} storage initialized`);
    } catch (error) {
      this.handleError(error, 'initialization');
      throw error;
    }
  }

  async uploadFile(filePath, key, options = {}) {
    try {
      const fileStream = fs.createReadStream(filePath);
      const uploadParams = {
        Bucket: this.config.bucket,
        Key: key,
        Body: fileStream,
        ContentType: options.contentType,
        Metadata: options.metadata
      };

      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      const command = new PutObjectCommand(uploadParams);
      const result = await this.client.send(command);

      // Generar URL firmada si es necesario
      const url = options.public 
        ? `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`
        : await this.generateSignedUrl(key, options.expiresIn || 3600);

      return {
        key,
        url,
        etag: result.ETag,
        bucket: this.config.bucket
      };
    } catch (error) {
      this.handleError(error, { filePath, key });
      throw new AppError('Error subiendo archivo', 500, error.message);
    }
  }

  async downloadFile(key, localPath) {
    try {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key
      });

      const response = await this.client.send(command);
      const writeStream = fs.createWriteStream(localPath);

      return new Promise((resolve, reject) => {
        response.Body.pipe(writeStream)
          .on('finish', () => resolve({ key, localPath }))
          .on('error', reject);
      });
    } catch (error) {
      this.handleError(error, { key, localPath });
      throw new AppError('Error descargando archivo', 500, error.message);
    }
  }

  async deleteFile(key) {
    try {
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key
      });

      await this.client.send(command);
      return { key, deleted: true };
    } catch (error) {
      this.handleError(error, { key });
      throw new AppError('Error eliminando archivo', 500, error.message);
    }
  }

  async generateSignedUrl(key, expiresIn = 3600) {
    try {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      this.handleError(error, { key, expiresIn });
      throw new AppError('Error generando URL firmada', 500, error.message);
    }
  }

  async listFiles(prefix = '', maxKeys = 1000) {
    try {
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys
      });

      const response = await this.client.send(command);
      return response.Contents || [];
    } catch (error) {
      this.handleError(error, { prefix, maxKeys });
      throw new AppError('Error listando archivos', 500, error.message);
    }
  }

  async healthCheck() {
    try {
      const { HeadBucketCommand } = await import('@aws-sdk/client-s3');
      const command = new HeadBucketCommand({
        Bucket: this.config.bucket
      });

      await this.client.send(command);
      
      return {
        status: 'healthy',
        provider: this.provider,
        bucket: this.config.bucket,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
}

// Registrar almacenamiento en la nube
integrationRegistry.register('storage', new CloudStorageAdapter({
  provider: process.env.CLOUD_STORAGE_PROVIDER || 'aws',
  bucket: process.env.CLOUD_STORAGE_BUCKET,
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}));
```

### 19.6 API de Terceros

#### REST API Client Genérico
```javascript
/**
 * Cliente HTTP genérico para APIs de terceros
 */
class APIClient extends IntegrationAdapter {
  constructor(config) {
    super(config);
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'CERMONT-Backend/1.0',
      ...config.headers
    };
  }

  async initialize() {
    // Verificar conectividad
    try {
      await this.request('GET', '/health');
      this.logger.info(`API client initialized: ${this.baseURL}`);
    } catch (error) {
      this.logger.warn(`API client initialization failed: ${error.message}`);
      // No fallar la inicialización por problemas de conectividad
    }
  }

  async request(method, endpoint, data = null, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method,
      headers: { ...this.headers, ...options.headers },
      timeout: options.timeout || this.timeout,
      ...options
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    let lastError;
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        this.logger.debug(`API request: ${method} ${url} (attempt ${attempt})`);

        const response = await fetch(url, config);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        this.logger.debug(`API response: ${response.status} from ${url}`);
        return responseData;

      } catch (error) {
        lastError = error;
        this.logger.warn(`API request failed (attempt ${attempt}/${this.retries}): ${error.message}`);

        if (attempt < this.retries) {
          // Esperar antes del siguiente intento (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.handleError(lastError, { method, endpoint, data });
    throw lastError;
  }

  // Métodos convenientes
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, null, options);
  }

  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  async patch(endpoint, data, options = {}) {
    return this.request('PATCH', endpoint, data, options);
  }

  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }

  async healthCheck() {
    try {
      const start = Date.now();
      await this.get('/health');
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        baseURL: this.baseURL,
        latency: `${latency}ms`,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        baseURL: this.baseURL,
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
}

/**
 * Cliente específico para API de clima
 */
class WeatherAPIClient extends APIClient {
  constructor(config) {
    super({
      baseURL: 'https://api.openweathermap.org/data/2.5',
      timeout: 10000,
      retries: 2,
      ...config
    });
  }

  async getWeatherByCoordinates(lat, lng) {
    const apiKey = this.config.apiKey;
    return this.get(`/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=es`);
  }

  async getForecastByCoordinates(lat, lng, days = 5) {
    const apiKey = this.config.apiKey;
    return this.get(`/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=es&cnt=${days * 8}`);
  }
}

/**
 * Cliente específico para API de mapas
 */
class MapsAPIClient extends APIClient {
  constructor(config) {
    super({
      baseURL: 'https://maps.googleapis.com/maps/api',
      timeout: 15000,
      retries: 2,
      ...config
    });
  }

  async geocodeAddress(address) {
    const apiKey = this.config.apiKey;
    return this.get(`/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
  }

  async reverseGeocode(lat, lng) {
    const apiKey = this.config.apiKey;
    return this.get(`/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
  }

  async getDistance(origin, destination, mode = 'driving') {
    const apiKey = this.config.apiKey;
    return this.get(`/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=${mode}&key=${apiKey}`);
  }
}

// Registrar APIs de terceros
integrationRegistry.register('weather', new WeatherAPIClient({
  apiKey: process.env.OPENWEATHER_API_KEY
}));

integrationRegistry.register('maps', new MapsAPIClient({
  apiKey: process.env.GOOGLE_MAPS_API_KEY
}));
```

---

## 20. EXTENSIONES FUTURAS

### 20.1 Arquitectura de Microservicios

#### Estrategia de Migración a Microservicios
```
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Kong/KrakenD)              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • Autenticación JWT                              │    │
│  │  • Rate Limiting                                   │    │
│  │  • Load Balancing                                  │    │
│  │  • Request Routing                                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
┌───────────────▼───────────────┐▼───────────────▼───────────────┐
│       AUTH SERVICE           │      ORDER SERVICE             │
│  ┌─────────────────────────┐ │  ┌─────────────────────────┐   │
│  │  • User Management      │ │  │  • Order CRUD           │   │
│  │  • JWT Token Issuance   │ │  │  • Status Management    │   │
│  │  • Password Reset       │ │  │  • Assignment Logic      │   │
│  │  • Session Management   │ │  │  • Progress Tracking     │   │
│  └─────────────────────────┘ │  └─────────────────────────┘   │
└───────────────────────────────└─────────────────────────────────┘
                │
                │
┌───────────────▼───────────────┐
│       NOTIFICATION SERVICE    │
│  ┌─────────────────────────┐ │
│  │  • Email Service        │ │
│  │  • SMS Service          │ │
│  │  • Push Notifications   │ │
│  │  • Template Management  │ │
│  └─────────────────────────┘ │
└───────────────────────────────┘
```

#### User Service (Microservicio)
```javascript
// src/services/user-microservice/
// server.js
import express from 'express';
import mongoose from 'mongoose';
import { userRoutes } from './routes/user.routes.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();

// Middleware
app.use(express.json());
app.use(authMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    service: 'user-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/v1/users', userRoutes);

// Error handling
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: error.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`User service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
```

#### Order Service (Microservicio)
```javascript
// src/services/order-microservice/
// routes/order.routes.js
import express from 'express';
import { orderController } from '../controllers/order.controller.js';
import { validateOrder } from '../validators/order.validator.js';

const router = express.Router();

// GET /api/v1/orders - Listar órdenes
router.get('/', 
  validateOrder.list,
  orderController.list
);

// GET /api/v1/orders/:id - Obtener orden específica
router.get('/:id',
  validateOrder.getById,
  orderController.getById
);

// POST /api/v1/orders - Crear nueva orden
router.post('/',
  validateOrder.create,
  orderController.create
);

// PUT /api/v1/orders/:id - Actualizar orden
router.put('/:id',
  validateOrder.update,
  orderController.update
);

// PATCH /api/v1/orders/:id/status - Cambiar estado
router.patch('/:id/status',
  validateOrder.updateStatus,
  orderController.updateStatus
);

// POST /api/v1/orders/:id/assign - Asignar usuarios
router.post('/:id/assign',
  validateOrder.assign,
  orderController.assignUsers
);

export { router as orderRoutes };
```

#### API Gateway Configuration
```javascript
// api-gateway/config/routes.js
export const routes = [
  // User Service Routes
  {
    path: '/api/v1/users',
    service: 'user-service',
    port: 3001,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    auth: true,
    roles: ['admin', 'engineer', 'supervisor']
  },

  // Order Service Routes
  {
    path: '/api/v1/orders',
    service: 'order-service',
    port: 3002,
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    auth: true,
    roles: ['technician', 'engineer', 'supervisor', 'admin']
  },

  // Notification Service Routes
  {
    path: '/api/v1/notifications',
    service: 'notification-service',
    port: 3003,
    methods: ['GET', 'POST'],
    auth: true
  },

  // Auth Service Routes (públicas)
  {
    path: '/api/v1/auth',
    service: 'auth-service',
    port: 3004,
    methods: ['POST'],
    auth: false
  }
];
```

### 20.2 GraphQL API

#### Schema Definition
```graphql
# schema.graphql
type Query {
  # Users
  users(filter: UserFilter, pagination: PaginationInput): UserConnection!
  user(id: ID!): User
  currentUser: User
  
  # Orders
  orders(filter: OrderFilter, pagination: PaginationInput): OrderConnection!
  order(id: ID!): Order
  
  # Audit
  auditLogs(filter: AuditLogFilter, pagination: PaginationInput): AuditLogConnection!
  
  # System
  systemHealth: SystemHealth!
  systemMetrics: SystemMetrics!
}

type Mutation {
  # Auth
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  refreshToken(input: RefreshTokenInput!): AuthPayload!
  logout: Boolean!
  
  # Users
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  changePassword(input: ChangePasswordInput!): Boolean!
  
  # Orders
  createOrder(input: CreateOrderInput!): Order!
  updateOrder(id: ID!, input: UpdateOrderInput!): Order!
  updateOrderStatus(id: ID!, status: OrderStatus!): Order!
  assignOrderUsers(id: ID!, userIds: [ID!]!): Order!
  addOrderNote(id: ID!, note: String!): Order!
  
  # Files
  uploadFile(file: Upload!, orderId: ID): File!
  deleteFile(id: ID!): Boolean!
}

type Subscription {
  # Real-time updates
  orderUpdated(orderId: ID!): Order!
  userStatusChanged: User!
  notificationReceived: Notification!
}

# Types
type User {
  id: ID!
  nombre: String!
  email: String!
  rol: UserRole!
  telefono: String
  cedula: String
  cargo: String
  especialidad: String
  avatar: String
  isActive: Boolean!
  lastLogin: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Order {
  id: ID!
  numeroOrden: String!
  clienteNombre: String!
  descripcion: String!
  estado: OrderStatus!
  prioridad: OrderPriority!
  costoEstimado: Float
  costoReal: Float
  fechaInicioEstimada: DateTime
  fechaFinEstimada: DateTime
  lugar: String
  coordenadas: Coordinates
  poNumber: String
  progreso: Float!
  assignedTo: [User!]!
  notas: [OrderNote!]!
  archivos: [File!]!
  createdBy: User!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type OrderNote {
  id: ID!
  texto: String!
  autor: User!
  fecha: DateTime!
}

type File {
  id: ID!
  nombre: String!
  url: String!
  tipo: String!
  tamano: Int!
  uploadedBy: User!
  uploadedAt: DateTime!
}

type Coordinates {
  lat: Float!
  lng: Float!
}

type AuthPayload {
  user: User!
  tokens: AuthTokens!
}

type AuthTokens {
  accessToken: String!
  refreshToken: String!
  expiresIn: Int!
}

type SystemHealth {
  status: HealthStatus!
  services: [ServiceHealth!]!
  timestamp: DateTime!
}

type ServiceHealth {
  name: String!
  status: HealthStatus!
  latency: String
  error: String
}

# Enums
enum UserRole {
  TECHNICIAN
  ENGINEER
  SUPERVISOR
  COORDINATOR_HES
  ADMIN
  ROOT
}

enum OrderStatus {
  PENDING
  PLANNING
  IN_PROGRESS
  COMPLETED
  INVOICING
  INVOICED
  PAID
  CANCELLED
}

enum OrderPriority {
  BAJA
  MEDIA
  ALTA
  URGENTE
}

enum HealthStatus {
  HEALTHY
  WARNING
  ERROR
}

# Inputs
input UserFilter {
  rol: UserRole
  isActive: Boolean
  search: String
}

input OrderFilter {
  estado: OrderStatus
  prioridad: OrderPriority
  assignedTo: ID
  clienteNombre: String
  fechaDesde: DateTime
  fechaHasta: DateTime
}

input PaginationInput {
  cursor: String
  limit: Int
}

input RegisterInput {
  nombre: String!
  email: String!
  password: String!
  rol: UserRole!
  telefono: String
  cedula: String
}

input LoginInput {
  email: String!
  password: String!
}

input RefreshTokenInput {
  refreshToken: String!
}

input CreateUserInput {
  nombre: String!
  email: String!
  password: String!
  rol: UserRole!
  telefono: String
  cedula: String
  cargo: String
  especialidad: String
}

input UpdateUserInput {
  nombre: String
  telefono: String
  cargo: String
  especialidad: String
  avatar: String
  isActive: Boolean
}

input ChangePasswordInput {
  currentPassword: String!
  newPassword: String!
}

input CreateOrderInput {
  clienteNombre: String!
  descripcion: String!
  prioridad: OrderPriority
  costoEstimado: Float
  fechaInicioEstimada: DateTime
  fechaFinEstimada: DateTime
  lugar: String
  coordenadas: CoordinatesInput
  poNumber: String
}

input UpdateOrderInput {
  clienteNombre: String
  descripcion: String
  prioridad: OrderPriority
  costoEstimado: Float
  fechaInicioEstimada: DateTime
  fechaFinEstimada: DateTime
  lugar: String
  coordenadas: CoordinatesInput
  poNumber: String
}

input CoordinatesInput {
  lat: Float!
  lng: Float!
}

# Scalars
scalar DateTime
scalar Upload
```

#### GraphQL Resolvers
```javascript
// resolvers/index.js
import { userResolvers } from './user.resolvers.js';
import { orderResolvers } from './order.resolvers.js';
import { authResolvers } from './auth.resolvers.js';
import { systemResolvers } from './system.resolvers.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...orderResolvers.Query,
    ...systemResolvers.Query
  },
  
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...orderResolvers.Mutation
  },
  
  Subscription: {
    ...orderResolvers.Subscription,
    ...userResolvers.Subscription
  },
  
  // Type resolvers
  User: {
    __resolveReference: (reference) => {
      return User.findById(reference.id);
    }
  },
  
  Order: {
    __resolveReference: (reference) => {
      return Order.findById(reference.id);
    },
    
    assignedTo: async (order) => {
      return User.find({ _id: { $in: order.assignedTo } });
    },
    
    createdBy: async (order) => {
      return User.findById(order.createdBy);
    },
    
    notas: async (order) => {
      return order.notas.map(note => ({
        ...note,
        autor: User.findById(note.autor)
      }));
    }
  }
};
```

#### Apollo Server Setup
```javascript
// graphql/server.js
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';

import { typeDefs } from './schema.js';
import { resolvers } from './resolvers/index.js';
import { authDirective } from './directives/auth.js';
import { getUserFromToken } from '../utils/auth.js';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Aplicar directivas
const schemaWithAuth = authDirective(schema);

const app = express();
const httpServer = http.createServer(app);

// WebSocket server para subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
});

const serverCleanup = useServer(
  {
    schema: schemaWithAuth,
    context: (ctx) => {
      // Contexto para subscriptions
      const token = ctx.connectionParams?.authorization?.replace('Bearer ', '');
      const user = token ? getUserFromToken(token) : null;
      
      return { user };
    }
  },
  wsServer
);

const server = new ApolloServer({
  schema: schemaWithAuth,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          }
        };
      }
    }
  ],
  context: ({ req }) => {
    // Contexto para queries/mutations
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = token ? getUserFromToken(token) : null;
    
    return { user, req };
  }
});

await server.start();

app.use(
  '/graphql',
  cors(),
  json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token })
  })
);

const PORT = process.env.GRAPHQL_PORT || 4001;

httpServer.listen(PORT, () => {
  console.log(`🚀 GraphQL server ready at http://localhost:${PORT}/graphql`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
});
```

### 20.3 Machine Learning y Analytics

#### Sistema de Recomendaciones
```javascript
/**
 * Servicio de recomendaciones basado en ML
 */
class RecommendationService extends IntegrationAdapter {
  constructor(config) {
    super(config);
    this.model = null;
    this.trainingData = [];
  }

  async initialize() {
    try {
      // Cargar modelo de ML (TensorFlow.js o similar)
      // this.model = await tf.loadLayersModel('file://./models/recommendation-model.json');
      
      this.logger.info('Recommendation service initialized');
    } catch (error) {
      this.handleError(error, 'initialization');
      // No fallar si el modelo no está disponible
    }
  }

  /**
   * Recomendar técnicos para una orden
   */
  async recommendTechnicians(orderId) {
    try {
      const order = await Order.findById(orderId).populate('assignedTo');
      
      if (!order) {
        throw new AppError('Orden no encontrada', 404);
      }

      // Features para el modelo
      const features = await this.extractOrderFeatures(order);
      
      // Si tenemos modelo ML, usarlo
      if (this.model) {
        const predictions = await this.model.predict(features);
        return this.formatPredictions(predictions);
      }
      
      // Fallback: lógica basada en reglas
      return this.ruleBasedRecommendations(order);
      
    } catch (error) {
      this.handleError(error, { orderId });
      throw error;
    }
  }

  /**
   * Predecir tiempo de completación
   */
  async predictCompletionTime(orderId) {
    try {
      const order = await Order.findById(orderId);
      
      // Features históricas
      const historicalData = await this.getHistoricalData(order);
      
      // Modelo de regresión para tiempo
      const predictedHours = await this.predictTime(historicalData);
      
      return {
        orderId,
        predictedHours,
        confidence: 0.85, // Placeholder
        basedOn: historicalData.length
      };
      
    } catch (error) {
      this.handleError(error, { orderId });
      throw error;
    }
  }

  /**
   * Detectar anomalías en órdenes
   */
  async detectAnomalies() {
    try {
      const recentOrders = await Order.find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      const anomalies = [];
      
      for (const order of recentOrders) {
        const score = await this.calculateAnomalyScore(order);
        
        if (score > this.config.anomalyThreshold) {
          anomalies.push({
            orderId: order._id,
            score,
            reasons: await this.getAnomalyReasons(order, score)
          });
        }
      }

      return anomalies;
      
    } catch (error) {
      this.handleError(error, 'anomaly-detection');
      throw error;
    }
  }

  /**
   * Extraer features de una orden para ML
   */
  async extractOrderFeatures(order) {
    const features = {
      priority: this.encodePriority(order.prioridad),
      estimatedCost: order.costoEstimado || 0,
      descriptionLength: order.descripcion.length,
      hasLocation: !!order.lugar,
      hasCoordinates: !!(order.coordenadas?.lat && order.coordenadas?.lng),
      wordCount: order.descripcion.split(' ').length,
      hasAttachments: order.archivos.length > 0,
      clientHistory: await this.getClientOrderHistory(order.clienteNombre)
    };

    return features;
  }

  /**
   * Recomendaciones basadas en reglas (fallback)
   */
  async ruleBasedRecommendations(order) {
    const technicians = await User.find({ 
      rol: 'technician',
      isActive: true 
    });

    const scoredTechnicians = await Promise.all(
      technicians.map(async (tech) => {
        let score = 0;
        
        // Puntaje por especialidad
        if (tech.especialidad && order.descripcion.toLowerCase().includes(tech.especialidad.toLowerCase())) {
          score += 30;
        }
        
        // Puntaje por carga de trabajo (menos órdenes = mejor)
        const activeOrders = await Order.countDocuments({
          assignedTo: tech._id,
          estado: { $in: ['in_progress', 'planning'] }
        });
        score += Math.max(0, 20 - activeOrders * 2);
        
        // Puntaje por proximidad (si hay coordenadas)
        if (order.coordenadas && tech.ubicacion) {
          const distance = this.calculateDistance(order.coordenadas, tech.ubicacion);
          score += Math.max(0, 15 - distance / 10); // Menos distancia = mejor
        }
        
        return {
          technician: tech,
          score: Math.min(100, score),
          factors: {
            specialty: tech.especialidad || false,
            workload: activeOrders,
            distance: order.coordenadas ? this.calculateDistance(order.coordenadas, tech.ubicacion) : null
          }
        };
      })
    );

    return scoredTechnicians
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5
  }

  encodePriority(priority) {
    const mapping = { baja: 0, media: 1, alta: 2, urgente: 3 };
    return mapping[priority] || 1;
  }

  calculateDistance(coord1, coord2) {
    // Fórmula de Haversine simplificada
    const R = 6371; // Radio de la Tierra en km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    
    return R * Math.sqrt(dLat * dLat + dLng * dLng);
  }

  async getClientOrderHistory(clientName) {
    return await Order.countDocuments({ clienteNombre: clientName });
  }

  async healthCheck() {
    return {
      status: 'healthy',
      modelLoaded: !!this.model,
      lastCheck: new Date().toISOString()
    };
  }
}

// Registrar servicio de recomendaciones
integrationRegistry.register('recommendations', new RecommendationService({
  anomalyThreshold: 0.8,
  modelPath: './models/recommendation-model.json'
}));
```

### 20.4 IoT y Sensores

#### Integración con Dispositivos IoT
```javascript
/**
 * Servicio para integración con dispositivos IoT
 */
class IoTService extends IntegrationAdapter {
  constructor(config) {
    super(config);
    this.mqttClient = null;
    this.devices = new Map();
    this.sensors = new Map();
  }

  async initialize() {
    try {
      // Conectar a broker MQTT
      this.mqttClient = mqtt.connect(this.config.brokerUrl, {
        username: this.config.username,
        password: this.config.password,
        clientId: `cermont-backend-${Date.now()}`
      });

      this.mqttClient.on('connect', () => {
        this.logger.info('Connected to MQTT broker');
        this.subscribeToTopics();
      });

      this.mqttClient.on('message', this.handleMessage.bind(this));
      this.mqttClient.on('error', (error) => {
        this.handleError(error, 'mqtt-connection');
      });

    } catch (error) {
      this.handleError(error, 'initialization');
      throw error;
    }
  }

  subscribeToTopics() {
    // Suscribirse a topics de sensores
    this.mqttClient.subscribe('cermont/sensors/+/data', { qos: 1 });
    this.mqttClient.subscribe('cermont/devices/+/status', { qos: 1 });
    this.mqttClient.subscribe('cermont/alerts/+', { qos: 1 });
    
    this.logger.info('Subscribed to MQTT topics');
  }

  async handleMessage(topic, message) {
    try {
      const payload = JSON.parse(message.toString());
      const topicParts = topic.split('/');
      
      switch (topicParts[1]) {
        case 'sensors':
          await this.handleSensorData(topicParts[2], payload);
          break;
        case 'devices':
          await this.handleDeviceStatus(topicParts[2], payload);
          break;
        case 'alerts':
          await this.handleAlert(topicParts[2], payload);
          break;
      }
    } catch (error) {
      this.handleError(error, { topic, message: message.toString() });
    }
  }

  /**
   * Manejar datos de sensores
   */
  async handleSensorData(sensorId, data) {
    try {
      // Guardar en base de datos
      const sensorData = new SensorData({
        sensorId,
        type: data.type,
        value: data.value,
        unit: data.unit,
        location: data.location,
        timestamp: new Date(data.timestamp),
        metadata: data.metadata
      });

      await sensorData.save();

      // Verificar umbrales y generar alertas
      await this.checkThresholds(sensorId, data);

      // Actualizar órdenes relacionadas
      await this.updateRelatedOrders(sensorId, data);

      this.logger.debug(`Sensor data processed: ${sensorId} = ${data.value} ${data.unit}`);
    } catch (error) {
      this.handleError(error, { sensorId, data });
    }
  }

  /**
   * Verificar umbrales de sensores
   */
  async checkThresholds(sensorId, data) {
    const sensor = await Sensor.findOne({ sensorId });
    
    if (!sensor || !sensor.thresholds) return;

    const { thresholds } = sensor;
    let alertTriggered = false;

    // Verificar umbrales
    if (data.value > thresholds.criticalHigh) {
      await this.createAlert(sensorId, 'CRITICAL_HIGH', data);
      alertTriggered = true;
    } else if (data.value > thresholds.warningHigh) {
      await this.createAlert(sensorId, 'WARNING_HIGH', data);
      alertTriggered = true;
    } else if (data.value < thresholds.criticalLow) {
      await this.createAlert(sensorId, 'CRITICAL_LOW', data);
      alertTriggered = true;
    } else if (data.value < thresholds.warningLow) {
      await this.createAlert(sensorId, 'WARNING_LOW', data);
      alertTriggered = true;
    }

    if (alertTriggered) {
      // Notificar vía WebSocket
      const wsService = getWebSocketService();
      wsService.broadcast('sensor-alert', {
        sensorId,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear alerta de sensor
   */
  async createAlert(sensorId, type, data) {
    const alert = new SensorAlert({
      sensorId,
      type,
      value: data.value,
      threshold: this.getThresholdValue(sensorId, type),
      message: this.generateAlertMessage(type, data),
      acknowledged: false,
      timestamp: new Date()
    });

    await alert.save();

    // Auditar alerta
    await createAuditLog({
      userId: null,
      userEmail: 'system@cermont.com',
      action: 'SENSOR_ALERT',
      resource: 'Sensor',
      resourceId: sensorId,
      description: `Alerta de sensor: ${alert.message}`,
      severity: type.includes('CRITICAL') ? 'CRITICAL' : 'HIGH'
    });
  }

  /**
   * Actualizar órdenes relacionadas con datos de sensores
   */
  async updateRelatedOrders(sensorId, data) {
    // Encontrar órdenes que podrían estar relacionadas con este sensor
    const relatedOrders = await Order.find({
      'sensores.sensorId': sensorId,
      estado: { $in: ['in_progress', 'planning'] }
    });

    for (const order of relatedOrders) {
      // Actualizar progreso basado en lecturas de sensores
      const sensorConfig = order.sensores.find(s => s.sensorId === sensorId);
      
      if (sensorConfig && sensorConfig.targetValue) {
        const progress = Math.min(100, (data.value / sensorConfig.targetValue) * 100);
        
        if (progress > order.progreso) {
          order.progreso = progress;
          await order.save();
          
          // Notificar progreso
          const wsService = getWebSocketService();
          wsService.notifyOrder(order._id, 'progress-update', {
            orderId: order._id,
            progress,
            sensorId,
            sensorValue: data.value
          });
        }
      }
    }
  }

  /**
   * Controlar dispositivos IoT
   */
  async controlDevice(deviceId, command, parameters = {}) {
    const topic = `cermont/devices/${deviceId}/commands`;
    const payload = {
      command,
      parameters,
      timestamp: new Date().toISOString(),
      requestId: generateId()
    };

    return new Promise((resolve, reject) => {
      this.mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 }, (error) => {
        if (error) {
          reject(error);
        } else {
          // Esperar respuesta
          const responseTopic = `cermont/devices/${deviceId}/responses`;
          const timeout = setTimeout(() => {
            this.mqttClient.unsubscribe(responseTopic);
            reject(new Error('Device response timeout'));
          }, 10000);

          this.mqttClient.subscribe(responseTopic, { qos: 1 });
          
          const responseHandler = (topic, message) => {
            if (topic === responseTopic) {
              const response = JSON.parse(message.toString());
              if (response.requestId === payload.requestId) {
                clearTimeout(timeout);
                this.mqttClient.unsubscribe(responseTopic);
                resolve(response);
              }
            }
          };

          this.mqttClient.on('message', responseHandler);
        }
      });
    });
  }

  async healthCheck() {
    return {
      status: this.mqttClient?.connected ? 'healthy' : 'disconnected',
      broker: this.config.brokerUrl,
      connectedDevices: this.devices.size,
      activeSensors: this.sensors.size,
      lastCheck: new Date().toISOString()
    };
  }

  async cleanup() {
    if (this.mqttClient) {
      this.mqttClient.end();
    }
  }
}

// Registrar servicio IoT
integrationRegistry.register('iot', new IoTService({
  brokerUrl: process.env.MQTT_BROKER_URL,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD
}));
```

### 20.5 Mobile App API

#### API Optimizada para Mobile
```javascript
/**
 * Middleware específico para mobile apps
 */
export const mobileOptimization = (req, res, next) => {
  // Detectar si es request de mobile
  const userAgent = req.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  if (isMobile) {
    // Optimizar respuesta para mobile
    res.mobile = true;
    
    // Comprimir más agresivamente
    req.mobileCompression = true;
    
    // Limitar campos en respuestas
    req.mobileFields = ['_id', 'nombre', 'email', 'rol', 'telefono', 'avatar', 'lastLogin'];
  }
  
  next();
};

/**
 * Endpoints optimizados para mobile
 */
router.get('/api/v1/mobile/dashboard', requireAuth, mobileOptimization, asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Dashboard optimizado para mobile
  const [myOrders, notifications, stats] = await Promise.all([
    // Órdenes asignadas (limitado para mobile)
    Order.find({ 
      assignedTo: user._id,
      estado: { $nin: ['completed', 'cancelled'] }
    })
    .select(req.mobile ? req.mobileFields : null)
    .limit(10)
    .sort({ updatedAt: -1 }),
    
    // Notificaciones recientes
    Notification.find({ userId: user._id, read: false })
    .limit(5)
    .sort({ createdAt: -1 }),
    
    // Estadísticas rápidas
    Order.aggregate([
      { $match: { assignedTo: user._id } },
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const dashboard = {
    user: req.mobile ? {
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      avatar: user.avatar
    } : user,
    
    orders: myOrders,
    notifications: notifications,
    stats: stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    
    // Datos optimizados para mobile
    quickActions: [
      { action: 'create_order', label: 'Nueva Orden', icon: 'plus' },
      { action: 'scan_qr', label: 'Escanear QR', icon: 'qr-code' },
      { action: 'emergency', label: 'Emergencia', icon: 'alert-triangle' }
    ]
  };

  successResponse(res, 'Dashboard cargado', dashboard);
}));

/**
 * API para sincronización offline
 */
router.post('/api/v1/mobile/sync', requireAuth, asyncHandler(async (req, res) => {
  const { lastSync, changes } = req.body;
  const user = req.user;
  
  const syncResult = {
    orders: [],
    users: [],
    notifications: [],
    lastSync: new Date()
  };

  // Aplicar cambios locales
  if (changes) {
    for (const change of changes) {
      try {
        await applyLocalChange(change, user);
      } catch (error) {
        // Log error pero continuar
        logger.error('Error applying local change:', error);
      }
    }
  }

  // Obtener cambios desde lastSync
  const syncTimestamp = lastSync ? new Date(lastSync) : new Date(0);

  syncResult.orders = await Order.find({
    $or: [
      { assignedTo: user._id },
      { createdBy: user._id }
    ],
    updatedAt: { $gt: syncTimestamp }
  }).limit(100);

  syncResult.notifications = await Notification.find({
    userId: user._id,
    createdAt: { $gt: syncTimestamp }
  }).limit(50);

  // Incluir usuarios relacionados
  const userIds = new Set();
  syncResult.orders.forEach(order => {
    userIds.add(order.createdBy);
    order.assignedTo.forEach(id => userIds.add(id));
  });

  syncResult.users = await User.find({
    _id: { $in: Array.from(userIds) },
    updatedAt: { $gt: syncTimestamp }
  }).select('nombre email avatar rol');

  successResponse(res, 'Sincronización completada', syncResult);
}));

/**
 * API para geolocalización y mapas offline
 */
router.get('/api/v1/mobile/map-data', requireAuth, asyncHandler(async (req, res) => {
  const { bounds, zoom } = req.query;
  
  // Datos optimizados para mapas offline
  const mapData = {
    orders: [],
    pois: [], // Points of interest
    routes: []
  };

  if (bounds && zoom > 10) { // Solo enviar datos detallados en zoom alto
    const [swLat, swLng, neLat, neLng] = bounds.split(',');
    
    mapData.orders = await Order.find({
      'coordenadas.lat': { $gte: parseFloat(swLat), $lte: parseFloat(neLat) },
      'coordenadas.lng': { $gte: parseFloat(swLng), $lte: parseFloat(neLng) },
      estado: { $in: ['pending', 'in_progress'] }
    }).select('_id numeroOrden clienteNombre coordenadas estado prioridad');
  }

  // POIs estáticos (oficinas, almacenes, etc.)
  mapData.pois = [
    {
      id: 'office-main',
      name: 'Oficina Principal',
      coordinates: { lat: 4.6097, lng: -74.0817 },
      type: 'office',
      address: 'Calle 123 #45-67, Bogotá'
    }
  ];

  successResponse(res, 'Datos de mapa obtenidos', mapData);
}));

/**
 * Push notifications para mobile
 */
router.post('/api/v1/mobile/register-device', requireAuth, asyncHandler(async (req, res) => {
  const { deviceToken, platform, deviceId } = req.body;
  const user = req.user;

  // Registrar dispositivo para push notifications
  await Device.upsert({
    userId: user._id,
    deviceId,
    platform,
    deviceToken,
    lastActive: new Date()
  });

  successResponse(res, 'Dispositivo registrado para notificaciones push');
}));

/**
 * QR Code scanning para órdenes
 */
router.post('/api/v1/mobile/scan-qr', requireAuth, upload.single('qr-image'), asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Procesar imagen QR (usar librería como quaggaJS o zxing)
  const qrData = await processQRCode(req.file.path);
  
  // Buscar orden por QR
  const order = await Order.findOne({ 
    $or: [
      { numeroOrden: qrData },
      { _id: qrData }
    ]
  });

  if (!order) {
    return errorResponse(res, 'Orden no encontrada', 404);
  }

  // Verificar permisos
  if (!order.assignedTo.includes(user._id) && user.rol !== 'admin') {
    return errorResponse(res, 'No tienes permisos para esta orden', 403);
  }

  successResponse(res, 'Orden encontrada', {
    order: order,
    scannedAt: new Date(),
    scanner: user.nombre
  });
}));
```

---

## 21. GLOSARIO

### 21.1 Términos Técnicos

#### A
- **API (Application Programming Interface)**: Interfaz de programación de aplicaciones que permite la comunicación entre diferentes sistemas de software.
- **Audit Log**: Registro de auditoría que documenta todas las operaciones realizadas en el sistema para fines de seguridad y cumplimiento.
- **Authentication**: Proceso de verificación de la identidad de un usuario o sistema.

#### B
- **Bearer Token**: Tipo de token de acceso que se incluye en el header de autorización HTTP.
- **Blacklist**: Lista de tokens revocados que ya no son válidos para autenticación.

#### C
- **Cache**: Almacenamiento temporal de datos frecuentemente accedidos para mejorar el rendimiento.
- **CORS (Cross-Origin Resource Sharing)**: Mecanismo que permite solicitudes desde un dominio diferente al del servidor.
- **CRUD**: Create, Read, Update, Delete - operaciones básicas de base de datos.

#### D
- **Docker**: Plataforma de contenedorización para empaquetar aplicaciones y sus dependencias.
- **DTO (Data Transfer Object)**: Objeto utilizado para transferir datos entre procesos.

#### E
- **Encryption**: Proceso de convertir datos en un formato codificado para proteger su confidencialidad.
- **Environment Variables**: Variables de configuración específicas del entorno de ejecución.

#### F
- **Frontend**: Parte de la aplicación con la que interactúa el usuario directamente.
- **Full-Text Search**: Búsqueda que examina todas las palabras en cada documento almacenado.

#### G
- **GraphQL**: Lenguaje de consulta para APIs que permite solicitar exactamente los datos necesarios.
- **Gzip**: Algoritmo de compresión utilizado para reducir el tamaño de las respuestas HTTP.

#### H
- **Hashing**: Proceso de convertir datos de entrada en una cadena de caracteres fija.
- **Health Check**: Verificación automática del estado y funcionamiento de un servicio.

#### I
- **IoT (Internet of Things)**: Red de dispositivos físicos conectados que pueden intercambiar datos.
- **Index**: Estructura de datos que mejora la velocidad de las operaciones de búsqueda en bases de datos.

#### J
- **JWT (JSON Web Token)**: Estándar abierto para crear tokens de acceso basados en JSON.
- **Jest**: Framework de testing para JavaScript con enfoque en simplicidad.

#### K
- **Kubernetes**: Plataforma de orquestación de contenedores para automatizar el despliegue y gestión de aplicaciones.

#### L
- **Latency**: Tiempo que tarda una solicitud en viajar desde el cliente al servidor y regresar.
- **Load Balancer**: Dispositivo que distribuye el tráfico de red entre múltiples servidores.

#### M
- **Middleware**: Software que actúa como puente entre diferentes aplicaciones o servicios.
- **MongoDB**: Base de datos NoSQL orientada a documentos.
- **Mongoose**: ODM (Object Document Mapper) para MongoDB en Node.js.

#### N
- **Namespace**: Contenedor lógico que agrupa un conjunto de identificadores bajo un nombre común.
- **Node.js**: Entorno de ejecución de JavaScript del lado del servidor.

#### O
- **OAuth**: Protocolo abierto para autorización que permite acceso limitado a recursos.
- **ODM (Object Document Mapper)**: Herramienta que mapea objetos de código a documentos de base de datos.

#### P
- **Pagination**: Técnica para dividir un conjunto de datos en páginas más pequeñas.
- **PM2**: Gestor de procesos para aplicaciones Node.js en producción.
- **Proxy**: Servidor intermediario que actúa como puente entre cliente y servidor.

#### Q
- **Query**: Solicitud de datos o información a una base de datos.
- **Queue**: Estructura de datos que sigue el principio FIFO (First In, First Out).

#### R
- **RBAC (Role-Based Access Control)**: Control de acceso basado en roles de usuario.
- **REST (Representational State Transfer)**: Estilo arquitectónico para diseñar APIs web.
- **Router**: Componente que dirige las solicitudes HTTP a los controladores apropiados.

#### S
- **Schema**: Estructura que define la forma de los documentos en una base de datos.
- **Session**: Período de tiempo durante el cual un usuario interactúa con una aplicación.
- **SSL/TLS**: Protocolos criptográficos para comunicaciones seguras en internet.

#### T
- **Token**: Cadena de caracteres que representa autorización para acceder a recursos.
- **Transaction**: Operación atómica que agrupa múltiples cambios en la base de datos.

#### U
- **URI (Uniform Resource Identifier)**: Cadena de caracteres que identifica un recurso en internet.
- **UUID (Universally Unique Identifier)**: Identificador único universal.

#### V
- **Validation**: Proceso de verificar que los datos cumplen con reglas específicas.
- **Virtual**: Campo calculado en tiempo real basado en otros campos del documento.

#### W
- **WebSocket**: Protocolo de comunicación bidireccional sobre TCP.
- **Webhook**: Callback HTTP definido por el usuario que se activa por eventos específicos.

#### X
- **XML**: Lenguaje de marcado extensible para almacenar e intercambiar datos.
- **XSS (Cross-Site Scripting)**: Vulnerabilidad de seguridad web que permite inyección de código malicioso.

### 21.2 Siglas y Acrónimos

| Sigla | Expansión | Descripción |
|-------|-----------|-------------|
| API | Application Programming Interface | Interfaz para comunicación entre sistemas |
| ATG | Automated Technical Guide | Guía Técnica Automatizada |
| CORS | Cross-Origin Resource Sharing | Compartir recursos entre orígenes |
| CRUD | Create, Read, Update, Delete | Operaciones básicas de datos |
| CSP | Content Security Policy | Política de seguridad de contenido |
| DTO | Data Transfer Object | Objeto de transferencia de datos |
| HES | Health, Environment & Safety | Salud, Ambiente y Seguridad |
| IoT | Internet of Things | Internet de las Cosas |
| JWT | JSON Web Token | Token web JSON |
| ML | Machine Learning | Aprendizaje Automático |
| MQTT | Message Queuing Telemetry Transport | Protocolo de mensajería |
| ODM | Object Document Mapper | Mapeador objeto-documento |
| PO | Purchase Order | Orden de Compra |
| RBAC | Role-Based Access Control | Control de acceso basado en roles |
| REST | Representational State Transfer | Transferencia de Estado Representacional |
| SLA | Service Level Agreement | Acuerdo de Nivel de Servicio |
| SMTP | Simple Mail Transfer Protocol | Protocolo de correo simple |
| SQL | Structured Query Language | Lenguaje de consulta estructurado |
| SSL | Secure Sockets Layer | Capa de sockets seguros |
| TCP | Transmission Control Protocol | Protocolo de control de transmisión |
| TLS | Transport Layer Security | Seguridad de capa de transporte |
| URI | Uniform Resource Identifier | Identificador uniforme de recursos |
| URL | Uniform Resource Locator | Localizador uniforme de recursos |
| UUID | Universally Unique Identifier | Identificador único universal |
| XSS | Cross-Site Scripting | Scripting entre sitios |

### 21.3 Estados y Códigos

#### Estados de Órdenes
| Estado | Descripción | Código |
|--------|-------------|--------|
| `pending` | Orden creada, esperando asignación | PENDING |
| `planning` | En fase de planificación | PLANNING |
| `in_progress` | Trabajo en ejecución | IN_PROGRESS |
| `completed` | Trabajo finalizado | COMPLETED |
| `invoicing` | En proceso de facturación | INVOICING |
| `invoiced` | Facturada | INVOICED |
| `paid` | Pagada | PAID |
| `cancelled` | Cancelada | CANCELLED |

#### Roles de Usuario
| Rol | Nivel | Descripción |
|-----|-------|-------------|
| `technician` | 1 | Técnico de campo |
| `engineer` | 2 | Ingeniero |
| `supervisor` | 3 | Supervisor |
| `coordinator_hes` | 4 | Coordinador HES |
| `admin` | 5 | Administrador |
| `root` | 6 | Super administrador |

#### Códigos de Error
| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| `VALIDATION_ERROR` | Datos de entrada inválidos | 400 |
| `EMAIL_EXISTS` | Email ya registrado | 409 |
| `INVALID_CREDENTIALS` | Credenciales inválidas | 401 |
| `TOKEN_EXPIRED` | Token expirado | 401 |
| `TOKEN_REVOKED` | Token revocado | 401 |
| `INSUFFICIENT_PERMISSIONS` | Permisos insuficientes | 403 |
| `RESOURCE_NOT_FOUND` | Recurso no encontrado | 404 |
| `RATE_LIMIT_EXCEEDED` | Límite de tasa excedido | 429 |
| `INTERNAL_ERROR` | Error interno del servidor | 500 |

### 21.4 Unidades y Medidas

#### Unidades de Tiempo
- **ms**: Milisegundos
- **s**: Segundos
- **m**: Minutos
- **h**: Horas
- **d**: Días

#### Unidades de Almacenamiento
- **B**: Bytes
- **KB**: Kilobytes (1024 B)
- **MB**: Megabytes (1024 KB)
- **GB**: Gigabytes (1024 MB)
- **TB**: Terabytes (1024 GB)

#### Unidades de Transferencia
- **bps**: Bits por segundo
- **Kbps**: Kilobits por segundo
- **Mbps**: Megabits por segundo
- **Gbps**: Gigabits por segundo

---

## 22. REFERENCIAS

### 22.1 Documentación Técnica

#### Node.js y Express
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Express.js API Reference](https://expressjs.com/en/api.html)

#### MongoDB y Mongoose
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)

#### Seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT.io](https://jwt.io/)
- [bcrypt vs Argon2](https://security.stackexchange.com/questions/112993/)

#### Testing
- [Jest Documentation](https://jestjs.io/docs/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Node.js Applications](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/)

### 22.2 RFCs y Estándares

#### HTTP y Web
- [RFC 7230 - HTTP/1.1 Message Syntax and Routing](https://tools.ietf.org/html/rfc7230)
- [RFC 7231 - HTTP/1.1 Semantics and Content](https://tools.ietf.org/html/rfc7231)
- [RFC 7235 - HTTP Authentication](https://tools.ietf.org/html/rfc7235)
- [RFC 6749 - OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)

#### APIs
- [RFC 3986 - Uniform Resource Identifier (URI)](https://tools.ietf.org/html/rfc3986)
- [OpenAPI Specification 3.0](https://swagger.io/specification/)
- [GraphQL Specification](https://graphql.github.io/graphql-spec/)

#### Seguridad
- [RFC 5246 - TLS 1.2](https://tools.ietf.org/html/rfc5246)
- [RFC 8446 - TLS 1.3](https://tools.ietf.org/html/rfc8446)
- [RFC 5280 - X.509 Certificate](https://tools.ietf.org/html/rfc5280)

### 22.3 Librerías y Frameworks

#### Core Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "argon2": "^0.31.1",
  "jose": "^4.15.4",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "compression": "^1.7.4",
  "express-rate-limit": "^7.1.5",
  "express-mongo-sanitize": "^2.2.0",
  "xss-clean": "^0.1.4",
  "multer": "^1.4.5-lts.1",
  "nodemailer": "^6.9.7",
  "socket.io": "^4.7.4",
  "winston": "^3.11.0",
  "morgan": "^1.10.0",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.0",
  "joi": "^17.11.0",
  "dotenv": "^16.3.1",
  "cross-env": "^7.0.3"
}
```

#### Development Dependencies
```json
{
  "jest": "^29.7.0",
  "supertest": "^6.3.4",
  "eslint": "^8.55.0",
  "prettier": "^3.1.1",
  "nodemon": "^3.0.2",
  "babel-jest": "^29.7.0",
  "@babel/core": "^7.23.6",
  "@babel/preset-env": "^7.23.6",
  "pm2": "^5.3.0",
  "clinic": "^13.0.0",
  " Artillery": "^2.0.8"
}
```

### 22.4 Herramientas de Desarrollo

#### IDE y Editores
- **Visual Studio Code**: Editor principal con extensiones para Node.js
- **WebStorm**: IDE completo para desarrollo JavaScript
- **Sublime Text**: Editor ligero con buena integración

#### Base de Datos
- **MongoDB Compass**: GUI para MongoDB
- **Studio 3T**: Herramienta avanzada para MongoDB
- **Robo 3T**: Cliente MongoDB gratuito

#### API Testing
- **Postman**: Plataforma completa para testing de APIs
- **Insomnia**: Cliente REST alternativo
- **Thunder Client**: Extensión de VS Code

#### Monitoreo
- **PM2**: Monitor de procesos
- **Grafana**: Dashboards de métricas
- **Prometheus**: Recolección de métricas
- **ELK Stack**: Elasticsearch, Logstash, Kibana

### 22.5 Recursos de Aprendizaje

#### Cursos y Tutoriales
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB University](https://university.mongodb.com/)
- [JWT Handbook](https://tools.ietf.org/html/rfc8725)

#### Comunidades
- [Stack Overflow - Node.js](https://stackoverflow.com/questions/tagged/node.js)
- [MongoDB Community Forums](https://community.mongodb.com/)
- [Express.js GitHub](https://github.com/expressjs/express)
- [OWASP Community](https://owasp.org/)

#### Blogs y Artículos
- [Node.js Blog](https://nodejs.org/en/blog/)
- [MongoDB Blog](https://www.mongodb.com/blog)
- [Express.js Blog](https://expressjs.com/en/blog.html)
- [RisingStack Blog](https://blog.risingstack.com/)

### 22.6 Estándares Industriales

#### Seguridad
- **ISO 27001**: Sistema de gestión de seguridad de la información
- **NIST Cybersecurity Framework**: Marco de ciberseguridad
- **GDPR**: Reglamento General de Protección de Datos (Europa)
- **SOX**: Sarbanes-Oxley Act (EE.UU.)

#### Calidad de Software
- **ISO 9001**: Sistema de gestión de calidad
- **CMMI**: Capability Maturity Model Integration
- **Agile Manifesto**: Manifiesto Ágil
- **DevOps Practices**: Prácticas de desarrollo y operaciones

#### APIs
- **REST API Design Guidelines**: Guías de diseño REST
- **API Versioning Strategies**: Estrategias de versionado
- **HATEOAS**: Hypermedia As The Engine Of Application State
- ** Richardson Maturity Model**: Modelo de madurez de Richardson

---

## 23. ANEXOS

### 23.1 Diagramas de Arquitectura

#### Diagrama de Componentes del Sistema
```
┌─────────────────────────────────────────────────────────────────┐
│                    CERMONT ATG BACKEND                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API LAYER                            │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  • REST API (Express.js)                       │    │    │
│  │  │  • GraphQL API (Apollo Server)                 │    │    │
│  │  │  • WebSocket API (Socket.IO)                   │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 BUSINESS LOGIC LAYER                   │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  • Services (User, Order, Auth, etc.)           │    │    │
│  │  │  • Business Rules & Validation                  │    │    │
│  │  │  • Integration Adapters                         │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   DATA LAYER                           │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  • MongoDB Collections                          │    │    │
│  │  │  • Mongoose ODM                                 │    │    │
│  │  │  • Cache Layer (In-Memory + Redis)              │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 INFRASTRUCTURE LAYER                   │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  • Authentication & Authorization               │    │    │
│  │  │  • Security Middleware                          │    │    │
│  │  │  • Logging & Monitoring                         │    │    │
│  │  │  • File Storage & Upload                        │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

#### Diagrama de Flujo de Autenticación
```
1. Login Request
      │
      ▼
2. Validate Input ──► Error 400
      │
      ▼
3. Find User ──────► User Not Found ──► Error 401
      │
      ▼
4. Check Password ─► Invalid Password ─► Error 401
      │                    │
      ▼                    ▼
5. Check Lock ───► Account Locked ──► Error 423
      │
      ▼
6. Generate Tokens
      │
      ▼
7. Update Login Info
      │
      ▼
8. Return Tokens ──► Success 200
```

#### Diagrama de Estados de Órdenes
```
PENDING ───────► PLANNING ───────► IN_PROGRESS ───────► COMPLETED
    │                │                    │                    │
    │                │                    │                    │
    ▼                ▼                    ▼                    ▼
CANCELLED       CANCELLED           CANCELLED           INVOICING
                                                          │
                                                          ▼
                                                      INVOICED
                                                          │
                                                          ▼
                                                        PAID
```

### 23.2 Scripts de Automatización

#### Script de Inicialización del Proyecto
```bash
#!/bin/bash
# scripts/init-project.sh

echo "🚀 Inicializando proyecto CERMONT Backend..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB no está instalado localmente"
    echo "   Asegúrate de tener MongoDB corriendo en el puerto 27017"
fi

# Crear directorios necesarios
echo "📁 Creando directorios..."
mkdir -p logs uploads ssl temp

# Copiar archivos de configuración de ejemplo
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado. Edítalo con tus configuraciones."
fi

# Ejecutar tests iniciales
echo "🧪 Ejecutando tests..."
npm run test

# Verificar linting
echo "🔍 Verificando código..."
npm run lint

echo "✅ Proyecto inicializado correctamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura las variables de entorno en .env"
echo "2. Asegúrate de que MongoDB esté corriendo"
echo "3. Ejecuta 'npm run dev' para desarrollo"
echo "4. Visita http://localhost:4000/api-docs para la documentación"
```

#### Script de Despliegue
```bash
#!/bin/bash
# scripts/deploy.sh

ENVIRONMENT=${1:-production}
TAG=${2:-latest}

echo "🚀 Desplegando CERMONT Backend - $ENVIRONMENT"

# Verificar que estamos en la rama correcta
if [ "$ENVIRONMENT" = "production" ]; then
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        echo "❌ Debes estar en la rama main para desplegar a producción"
        exit 1
    fi
fi

# Ejecutar tests
echo "🧪 Ejecutando tests..."
npm run test:ci
if [ $? -ne 0 ]; then
    echo "❌ Tests fallaron"
    exit 1
fi

# Build de la aplicación
echo "🔨 Construyendo aplicación..."
npm run build

# Ejecutar security audit
echo "🔒 Verificando seguridad..."
npm audit --audit-level high
if [ $? -ne 0 ]; then
    echo "⚠️  Vulnerabilidades de seguridad encontradas"
    read -p "¿Continuar con el despliegue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Crear imagen Docker
echo "🐳 Construyendo imagen Docker..."
docker build -t cermont-backend:$TAG .

# Desplegar según entorno
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🏭 Desplegando a producción..."
    
    # Backup de base de datos
    ./scripts/backup.sh
    
    # Desplegar con docker-compose
    docker-compose -f docker-compose.prod.yml up -d
    
    # Verificar health check
    sleep 30
    HEALTH=$(curl -s http://localhost:4100/api/v1/system/health | jq -r '.status')
    if [ "$HEALTH" != "healthy" ]; then
        echo "❌ Health check falló"
        exit 1
    fi
    
    # Ejecutar migraciones si existen
    docker-compose -f docker-compose.prod.yml exec app npm run migrate
    
else
    echo "🧪 Desplegando a staging..."
    docker-compose -f docker-compose.staging.yml up -d
fi

echo "✅ Despliegue completado exitosamente!"
```

### 23.3 Configuraciones de Ejemplo

#### Archivo .env.example
```bash
# Configuración del Servidor
NODE_ENV=development
PORT=4000
SSL_PORT=4100
SSL_ENABLED=false

# Base de Datos
MONGO_URI=mongodb://localhost:27017/cermont_db
MONGO_TEST_URI=mongodb://localhost:27017/cermont_test_db

# Autenticación JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-token-secret-here
JWT_REFRESH_EXPIRES_IN=7d

# Seguridad
BCRYPT_ROUNDS=12
ARGON2_TIME_COST=3
ARGON2_MEMORY_COST=4096
ARGON2_PARALLELISM=1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@cermont.com

# Almacenamiento en la Nube
CLOUD_STORAGE_PROVIDER=aws
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
CLOUD_STORAGE_BUCKET=cermont-files

# APIs Externas
OPENWEATHER_API_KEY=your-weather-api-key
GOOGLE_MAPS_API_KEY=your-maps-api-key

# Integraciones
SAP_INTEGRATION_ENABLED=false
SAP_HOST=your-sap-host
SAP_PORT=3300
SAP_CLIENT=100
SAP_USERNAME=your-sap-user
SAP_PASSWORD=your-sap-password

# Logging
LOG_LEVEL=info
LOGSTASH_HOST=logstash.cermont.com
LOGSTASH_PORT=5044

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# WebSocket
WS_PORT=4001

# PM2
PM2_INSTANCES=max
PM2_EXEC_MODE=cluster

# SSL (para producción)
SSL_CERT_PATH=./ssl/fullchain.pem
SSL_KEY_PATH=./ssl/privkey.pem

# Monitoreo
HEALTH_CHECK_INTERVAL=30000
METRICS_ENABLED=true

# Cache
CACHE_TTL=300
CACHE_CHECK_PERIOD=60

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# API Versioning
API_VERSION=v1

# CORS
CORS_ORIGIN=http://localhost:3000,https://app.cermont.com

# Compression
COMPRESSION_LEVEL=6
COMPRESSION_THRESHOLD=1024
```

#### docker-compose.yml para Desarrollo
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "4000:4000"
      - "4100:4100"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - MONGO_URI=mongodb://mongodb:27017/cermont_db
    depends_on:
      - mongodb
    command: npm run dev
    networks:
      - cermont-dev

  mongodb:
    image: mongo:8.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=cermont_db
    volumes:
      - mongodb_data:/data/db
      - ./docker/mongo-init:/docker-entrypoint-initdb.d
    networks:
      - cermont-dev

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - cermont-dev

volumes:
  mongodb_data:

networks:
  cermont-dev:
    driver: bridge
```

### 23.4 Métricas y KPIs

#### KPIs de Sistema
```javascript
/**
 * Métricas y KPIs del sistema
 */
export const systemKPIs = {
  // Performance
  responseTime: {
    target: '< 200ms',
    critical: '> 1000ms',
    measurement: '95th percentile'
  },
  
  throughput: {
    target: '> 1000 req/min',
    measurement: 'requests per minute'
  },
  
  errorRate: {
    target: '< 0.1%',
    critical: '> 1%',
    measurement: 'percentage of failed requests'
  },
  
  uptime: {
    target: '> 99.9%',
    critical: '< 99%',
    measurement: 'system availability'
  },
  
  // Business
  activeUsers: {
    target: '> 50 daily',
    measurement: 'unique users per day'
  },
  
  ordersCreated: {
    target: '> 20 daily',
    measurement: 'orders created per day'
  },
  
  ordersCompleted: {
    target: '> 15 daily',
    measurement: 'orders completed per day'
  },
  
  averageOrderValue: {
    target: '> 500000 COP',
    measurement: 'average order cost'
  },
  
  // Technical
  testCoverage: {
    target: '> 80%',
    critical: '< 70%',
    measurement: 'code coverage percentage'
  },
  
  buildTime: {
    target: '< 5 min',
    critical: '> 10 min',
    measurement: 'CI/CD pipeline duration'
  },
  
  securityIncidents: {
    target: '0',
    critical: '> 1',
    measurement: 'security incidents per month'
  }
};
```

#### Dashboard de Métricas
```javascript
/**
 * Dashboard de métricas en tiempo real
 */
export const metricsDashboard = {
  overview: {
    uptime: '99.95%',
    activeUsers: 45,
    totalOrders: 1250,
    completedOrders: 1180,
    pendingOrders: 70
  },
  
  performance: {
    avgResponseTime: '145ms',
    p95ResponseTime: '280ms',
    requestsPerMinute: 1250,
    errorRate: '0.05%'
  },
  
  database: {
    connections: 15,
    queryLatency: '12ms',
    cacheHitRate: '94%',
    storageUsed: '2.3GB'
  },
  
  security: {
    activeSessions: 67,
    failedLogins: 3,
    blockedIPs: 12,
    auditEvents: 1250
  },
  
  integrations: {
    sapStatus: 'healthy',
    emailStatus: 'healthy',
    storageStatus: 'healthy',
    iotDevices: 25
  }
};
```

---

## 24. CONTROL DE CAMBIOS

### 24.1 Historial de Versiones

#### Versión 1.0.0 (Actual)
**Fecha:** Diciembre 2025  
**Tipo:** Release inicial completo  

**Nuevas Funcionalidades:**
- ✅ API REST completa con 30+ endpoints
- ✅ Sistema de autenticación JWT con refresh tokens
- ✅ Autorización RBAC con 8 roles jerárquicos
- ✅ Gestión completa de órdenes de trabajo
- ✅ Gestión de usuarios con perfiles completos
- ✅ Sistema de auditoría completo
- ✅ Documentación Swagger/OpenAPI 3.0
- ✅ Caché inteligente con invalidación automática
- ✅ Compresión gzip/brotli
- ✅ Rate limiting avanzado
- ✅ Logging estructurado con Winston
- ✅ Testing completo (unitario, integración, e2e)
- ✅ Docker y CI/CD con GitHub Actions
- ✅ Monitoreo y health checks
- ✅ Integración con SAP (preparado)
- ✅ WebSockets para notificaciones en tiempo real
- ✅ Upload de archivos con validación
- ✅ Email service con templates
- ✅ Backup y restore automatizados

**Mejoras Técnicas:**
- Arquitectura limpia con separación de responsabilidades
- Validación completa con Joi
- Sanitización XSS/NoSQL injection
- Headers de seguridad avanzados
- Connection pooling MongoDB optimizado
- Índices de base de datos estratégicos
- Paginación cursor-based
- Error handling centralizado
- PM2 para gestión de procesos
- SSL/TLS con certificados automáticos

**Correcciones:**
- N/A (versión inicial)

#### Versión 0.9.0 (Beta)
**Fecha:** Noviembre 2025  
**Tipo:** Beta release  

**Nuevas Funcionalidades:**
- API básica funcional
- Autenticación y autorización básica
- CRUD de usuarios y órdenes
- Documentación básica

**Mejoras Técnicas:**
- Estructura de proyecto inicial
- Configuración básica de base de datos
- Testing básico

### 24.2 Próximas Versiones Planificadas

#### Versión 1.1.0 (Q1 2026)
**Funcionalidades Planeadas:**
- GraphQL API como alternativa a REST
- Dashboard de analytics en tiempo real
- Notificaciones push para mobile
- Integración completa con SAP
- Machine learning para recomendaciones
- API para aplicaciones móviles nativas

**Mejoras Técnicas:**
- Migración a microservicios (fase 1)
- Implementación de Redis para caché distribuido
- Optimización de queries con aggregation pipelines
- Implementación de circuit breakers
- Mejora de logging con ELK stack

#### Versión 1.2.0 (Q2 2026)
**Funcionalidades Planeadas:**
- IoT integration completa
- Predictive maintenance con ML
- Multi-tenancy para múltiples clientes
- API de marketplace para integraciones
- Advanced reporting y business intelligence
- Offline-first mobile capabilities

**Mejoras Técnicas:**
- Arquitectura de microservicios completa
- Kubernetes orchestration
- Service mesh con Istio
- Advanced monitoring con Prometheus/Grafana
- CI/CD pipeline avanzado

#### Versión 2.0.0 (Q3 2026)
**Funcionalidades Planeadas:**
- IA generativa para creación automática de órdenes
- Computer vision para análisis de imágenes
- Blockchain para trazabilidad de órdenes
- VR/AR para training técnico
- Advanced analytics con big data

**Mejoras Técnicas:**
- Serverless architecture
- Edge computing
- Advanced AI/ML capabilities
- Quantum-resistant cryptography

### 24.3 Política de Versionado

#### Versionado Semántico
Este proyecto sigue el versionado semántico (SemVer):

- **MAJOR.MINOR.PATCH** (ej: 1.2.3)
  - **MAJOR**: Cambios incompatibles con versiones anteriores
  - **MINOR**: Nuevas funcionalidades compatibles hacia atrás
  - **PATCH**: Correcciones de bugs compatibles hacia atrás

#### Ciclo de Releases
- **Releases menores**: Cada 2-3 meses
- **Releases mayores**: Anualmente o cuando hay cambios breaking
- **Hotfixes**: Tan pronto como sea necesario para bugs críticos

#### Soporte de Versiones
- **Versión actual**: Soporte completo
- **Últimas 2 versiones menores**: Soporte limitado
- **Versiones mayores anteriores**: Sin soporte oficial

### 24.4 Registro de Cambios Detallado

#### Cambios en v1.0.0
```
📦 NUEVO: Arquitectura completa del sistema
├── 🔐 Autenticación JWT con refresh tokens
├── 👥 Sistema RBAC con 8 roles
├── 📋 Gestión completa de órdenes
├── 👤 Gestión avanzada de usuarios
├── 📊 Sistema de auditoría completo
├── 📚 Documentación Swagger completa
├── 🚀 API REST con 30+ endpoints
├── 💾 Caché inteligente
├── 🗜️ Compresión automática
├── 🛡️ Rate limiting avanzado
├── 📝 Logging estructurado
├── 🧪 Testing completo (85% cobertura)
├── 🐳 Docker y contenedorización
├── 🔄 CI/CD con GitHub Actions
├── 📈 Monitoreo y métricas
├── 🔌 WebSockets para tiempo real
├── 📧 Email service con templates
├── 📁 File upload con validación
├── 💾 Backup automatizado
└── 🔧 Scripts de mantenimiento

🐛 CORREGIDO: N/A (versión inicial)

📈 MEJORADO: N/A (versión inicial)
```

---

## 25. LICENCIA

### 25.1 Licencia del Software

**CERMONT ATG Backend**  
Copyright © 2025 CERMONT SAS  
Todos los derechos reservados.

Este software y la documentación asociada son propiedad exclusiva de **CERMONT SAS**. Queda estrictamente prohibida la reproducción, distribución, modificación, o uso de este software sin la autorización expresa y por escrito de CERMONT SAS.

#### Condiciones de Uso
1. **Uso Interno**: Este software está diseñado exclusivamente para uso interno de CERMONT SAS y sus empleados autorizados.

2. **Confidencialidad**: Todo el código fuente, documentación, y conocimientos técnicos relacionados con este software son considerados información confidencial y propiedad intelectual de CERMONT SAS.

3. **Prohibiciones**: Queda expresamente prohibido:
   - Copiar, modificar, o distribuir el software
   - Reverse engineering o descompilación
   - Compartir credenciales de acceso o documentación
   - Usar el software para fines comerciales externos
   - Crear trabajos derivados sin autorización

4. **Responsabilidades**: Los usuarios de este software son responsables de:
   - Usar el sistema de acuerdo con las políticas de seguridad
   - Reportar cualquier vulnerabilidad o incidente de seguridad
   - Mantener la confidencialidad de sus credenciales
   - Cumplir con todas las regulaciones aplicables

#### Soporte y Mantenimiento
- **Soporte Técnico**: Disponible únicamente para empleados autorizados de CERMONT SAS
- **Mantenimiento**: Realizado exclusivamente por el equipo de desarrollo de CERMONT SAS
- **Actualizaciones**: Distribuidas únicamente a través de canales oficiales internos

#### Limitación de Responsabilidad
Este software se proporciona "tal cual", sin garantías de ningún tipo. CERMONT SAS no se hace responsable por daños directos, indirectos, incidentales, o consecuentes que puedan surgir del uso de este software.

#### Contacto
Para consultas relacionadas con esta licencia, contactar al departamento legal de CERMONT SAS.

**Fecha de última actualización:** Diciembre 2025  
**Versión de la licencia:** 1.0

---

**FIN DEL MANUAL TÉCNICO COMPLETO**

*Este manual técnico completo de CERMONT ATG Backend proporciona una documentación exhaustiva de 25 secciones que cubren todos los aspectos del sistema, desde la arquitectura básica hasta las extensiones futuras. El documento sirve como referencia definitiva para desarrolladores, administradores de sistemas, y stakeholders técnicos, asegurando una comprensión completa del sistema backend de gestión de órdenes de trabajo de CERMONT SAS.*