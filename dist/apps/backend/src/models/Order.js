import mongoose, { Schema } from 'mongoose';
import { ORDER_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import AuditLog from './AuditLog';
const PRIORIDADES = ['baja', 'media', 'alta', 'urgente'];
const CATEGORIAS = ['instalacion', 'mantenimiento', 'reparacion', 'consultoria', 'otro'];
const MONEDAS = ['COP', 'USD'];
const ARCHIVO_TIPOS = ['documento', 'foto', 'otro'];
const ContactSchema = new Schema({
    nombre: { type: String, trim: true, maxlength: [100] },
    email: { type: String, trim: true, lowercase: true, maxlength: [100] },
    telefono: { type: String, trim: true, maxlength: [20] },
}, { _id: false });
const ArchivoSchema = new Schema({
    nombre: { type: String, required: [true, 'Nombre requerido'], trim: true, maxlength: [255] },
    url: { type: String, required: [true, 'URL requerida'], trim: true },
    tipo: { type: String, enum: ARCHIVO_TIPOS },
    tamaño: { type: Number, min: [0, 'Tamaño no negativo'] },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
}, { _id: true });
const orderSchema = new Schema({
    numeroOrden: {
        type: String,
        required: [true, 'Número de orden requerido'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    code: {
        type: String,
        required: [true, 'Código requerido'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    clienteNombre: {
        type: String,
        required: [true, 'Nombre cliente requerido'],
        trim: true,
        maxlength: [200],
    },
    clienteContacto: ContactSchema,
    poNumber: { type: String, trim: true, maxlength: [100] },
    descripcion: {
        type: String,
        required: [true, 'Descripción requerida'],
        trim: true,
        maxlength: [2000],
    },
    alcance: {
        type: String,
        trim: true,
        maxlength: [3000],
    },
    lugar: {
        type: String,
        required: [true, 'Lugar requerido'],
        trim: true,
        maxlength: [200],
    },
    coordenadas: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: [{ type: Number, min: -180, max: 180 }, { type: Number, min: -90, max: 90 }],
    },
    fechaInicio: {
        type: Date,
        required: [true, 'Fecha inicio requerida'],
    },
    fechaFinEstimada: { type: Date },
    fechaFinReal: { type: Date },
    estado: {
        type: String,
        required: true,
        enum: ORDER_STATUS,
        default: ORDER_STATUS[0],
    },
    prioridad: {
        type: String,
        enum: PRIORIDADES,
        default: 'media',
    },
    asignadoA: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    creadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creador requerido'],
    },
    workPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkPlan' },
    workplans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkPlan' }],
    costoEstimado: {
        type: Number,
        default: 0,
        min: [0, 'Costo no negativo'],
    },
    costoReal: {
        type: Number,
        default: 0,
        min: [0, 'Costo no negativo'],
    },
    moneda: { type: String, enum: MONEDAS, default: 'COP' },
    metricas: {
        duracionEstimadaDias: { type: Number, default: 0 },
        duracionRealDias: { type: Number, default: 0 },
        sla: {
            tiempoRespuestaHoras: { type: Number, default: 24 },
            tiempoResolucionHoras: { type: Number, default: 72 },
            cumplido: { type: Boolean, default: true },
            fechaLimite: { type: Date },
        },
        diasAtrasados: { type: Number, default: 0 },
        variacionCostoPorcentaje: { type: Number, default: 0 },
    },
    historialEstados: [{
            estadoAnterior: { type: String, enum: ORDER_STATUS },
            estadoNuevo: { type: String, enum: ORDER_STATUS, required: true },
            cambiadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            comentario: { type: String, maxlength: [500] },
            fecha: { type: Date, default: Date.now },
            duracionEnEstado: { type: Number, default: 0 },
        }],
    archivos: [ArchivoSchema],
    notas: [{
            contenido: { type: String, required: true, maxlength: [1000] },
            autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            createdAt: { type: Date, default: Date.now },
        }],
    historial: [{
            accion: { type: String, required: true },
            usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            detalles: { type: mongoose.Schema.Types.Mixed },
            fecha: { type: Date, default: Date.now },
        }],
    facturacion: {
        numeroFactura: { type: String, trim: true, maxlength: [100] },
        fechaFactura: { type: Date },
        montoFacturado: { type: Number, min: [0] },
        sesNumber: { type: String, trim: true, maxlength: [100] },
        fechaSES: { type: Date },
        aprobadoPor: { type: String, trim: true, maxlength: [100] },
        fechaAprobacion: { type: Date },
        fechaPago: { type: Date },
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    categoria: {
        type: String,
        enum: CATEGORIAS,
        default: 'otro',
    },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    requiereAprobacion: { type: Boolean, default: false },
    aprobadoPorCliente: { type: Boolean, default: false },
    cctvReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CctvReport' }],
    evidences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }],
    toolKits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ToolKit' }],
}, {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
    strict: true,
    collection: 'orders',
});
orderSchema.index({ estado: 1 });
orderSchema.index({ prioridad: 1 });
orderSchema.index({ fechaInicio: -1 });
orderSchema.index({ clienteNombre: 1 });
orderSchema.index({ poNumber: 1 });
orderSchema.index({ estado: 1, fechaInicio: -1 });
orderSchema.index({ estado: 1, prioridad: 1 });
orderSchema.index({ clienteNombre: 1, createdAt: -1 });
orderSchema.index({ asignadoA: 1, estado: 1 });
orderSchema.index({ isActive: 1, isArchived: 1, createdAt: -1 });
orderSchema.index({ creadoPor: 1, estado: 1 });
orderSchema.index({ supervisorId: 1, estado: 1 });
orderSchema.index({ fechaFinEstimada: 1, estado: 1 });
orderSchema.index({
    numeroOrden: 'text',
    clienteNombre: 'text',
    descripcion: 'text',
    lugar: 'text',
    poNumber: 'text',
    tags: 'text',
});
orderSchema.index({ coordenadas: '2dsphere' });
orderSchema.index({ categoria: 1, estado: 1 });
orderSchema.index({ tags: 1 });
orderSchema.virtual('duracionDias').get(function () {
    if (!this.fechaInicio)
        return 0;
    const fin = this.fechaFinReal || this.fechaFinEstimada || new Date();
    return Math.ceil((fin.getTime() - this.fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
});
orderSchema.virtual('progreso').get(function () {
    const map = {
        [ORDER_STATUS[0]]: 0,
        [ORDER_STATUS[1]]: 20,
        [ORDER_STATUS[2]]: 50,
        [ORDER_STATUS[3]]: 80,
        [ORDER_STATUS[4]]: 90,
        [ORDER_STATUS[5]]: 95,
        [ORDER_STATUS[6]]: 100,
        [ORDER_STATUS[7]]: 0,
    };
    return map[this.estado] || 0;
});
orderSchema.virtual('variacionCosto').get(function () {
    if (this.costoEstimado === 0)
        return 0;
    return ((this.costoReal - this.costoEstimado) / this.costoEstimado) * 100;
});
orderSchema.virtual('estaAtrasada').get(function () {
    return !this.fechaFinReal && this.fechaFinEstimada && new Date() > this.fechaFinEstimada;
});
orderSchema.virtual('diasRestantes').get(function () {
    if (this.fechaFinReal || !this.fechaFinEstimada)
        return null;
    const diff = this.fechaFinEstimada.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});
orderSchema.virtual('esUrgente').get(function () {
    return this.prioridad === 'urgente' || (this.diasRestantes !== null && this.diasRestantes <= 3);
});
orderSchema.virtual('estadoDescriptivo').get(function () {
    const desc = {
        [ORDER_STATUS[0]]: 'Pendiente',
        [ORDER_STATUS[1]]: 'Planificación',
        [ORDER_STATUS[2]]: 'En Progreso',
        [ORDER_STATUS[3]]: 'Completada',
        [ORDER_STATUS[4]]: 'Facturando',
        [ORDER_STATUS[5]]: 'Facturada',
        [ORDER_STATUS[6]]: 'Pagada',
        [ORDER_STATUS[7]]: 'Cancelada',
    };
    return desc[this.estado] || this.estado;
});
orderSchema.pre('save', function (next) {
    if (this.isModified('code') && !this.code) {
        this.code = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }
    if (this.fechaInicio && this.fechaFinEstimada && this.fechaInicio > this.fechaFinEstimada) {
        return next(new Error('Fecha inicio no puede ser posterior a fin estimada'));
    }
    if (this.isModified('fechaInicio') || this.isModified('fechaFinEstimada') || this.isNew) {
        if (this.fechaInicio && this.fechaFinEstimada) {
            const diff = this.fechaFinEstimada.getTime() - this.fechaInicio.getTime();
            this.metricas.duracionEstimadaDias = Math.ceil(diff / (1000 * 60 * 60 * 24));
        }
    }
    if (this.isModified('fechaFinReal')) {
        if (this.fechaInicio && this.fechaFinReal) {
            const diff = this.fechaFinReal.getTime() - this.fechaInicio.getTime();
            this.metricas.duracionRealDias = Math.ceil(diff / (1000 * 60 * 60 * 24));
        }
    }
    if (this.isModified('fechaFinEstimada') || this.isNew) {
        const now = new Date();
        if (this.fechaFinEstimada && now > this.fechaFinEstimada && !this.fechaFinReal) {
            const diff = now.getTime() - this.fechaFinEstimada.getTime();
            this.metricas.diasAtrasados = Math.ceil(diff / (1000 * 60 * 60 * 24));
        }
        else {
            this.metricas.diasAtrasados = 0;
        }
    }
    if (this.isModified('costoReal') || this.isModified('costoEstimado') || this.isNew) {
        if (this.costoEstimado > 0) {
            this.metricas.variacionCostoPorcentaje = ((this.costoReal - this.costoEstimado) / this.costoEstimado) * 100;
        }
    }
    if (this.isNew) {
        this.historialEstados.push({
            estadoAnterior: undefined,
            estadoNuevo: this.estado,
            cambiadoPor: this.creadoPor,
            fecha: new Date(),
        });
    }
    if (this.isModified('estado') && !this.isNew) {
        const lastEntry = this.historialEstados[this.historialEstados.length - 1];
        const duracion = lastEntry ? (new Date().getTime() - lastEntry.fecha.getTime()) / (1000 * 60 * 60) : 0;
        this.historialEstados.push({
            estadoAnterior: lastEntry?.estadoNuevo,
            estadoNuevo: this.estado,
            cambiadoPor: this.creadoPor,
            comentario: '',
            fecha: new Date(),
            duracionEnEstado: duracion,
        });
        this.historial.push({
            accion: 'Cambio de estado',
            usuario: this.creadoPor,
            detalles: { from: lastEntry?.estadoNuevo, to: this.estado },
            fecha: new Date(),
        });
        logger.info(`Order ${this.numeroOrden} state change: ${lastEntry?.estadoNuevo} → ${this.estado}`);
    }
    next();
});
orderSchema.post('save', async function (doc, next) {
    try {
        const action = doc.isNew ? 'CREATE_ORDER' : 'UPDATE_ORDER';
        const description = doc.isNew ? 'Orden creada' : 'Orden actualizada';
        const metadata = {
            numeroOrden: doc.numeroOrden,
            estado: doc.estado,
            cambios: doc.isModified('estado') ? { old: undefined, new: doc.estado } : null,
        };
        await AuditLog.log({
            userId: doc.creadoPor,
            action,
            resource: 'Order',
            resourceId: doc._id,
            description,
            metadata,
            status: 'SUCCESS',
            severity: doc.isModified('estado') ? 'MEDIUM' : 'LOW',
        });
    }
    catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Audit error';
        logger.error('[Order] Audit failed', { error: errMsg, orderId: doc._id });
    }
    next();
});
orderSchema.methods.cambiarEstado = async function (nuevoEstado, userId, comentario = '') {
    const transiciones = {
        [ORDER_STATUS[0]]: [ORDER_STATUS[1], ORDER_STATUS[7]],
        [ORDER_STATUS[1]]: [ORDER_STATUS[2], ORDER_STATUS[0], ORDER_STATUS[7]],
        [ORDER_STATUS[2]]: [ORDER_STATUS[3], ORDER_STATUS[1], ORDER_STATUS[7]],
        [ORDER_STATUS[3]]: [ORDER_STATUS[4], ORDER_STATUS[2]],
        [ORDER_STATUS[4]]: [ORDER_STATUS[5], ORDER_STATUS[3]],
        [ORDER_STATUS[5]]: [ORDER_STATUS[6]],
        [ORDER_STATUS[6]]: [],
        [ORDER_STATUS[7]]: [],
    };
    if (!transiciones[this.estado]?.includes(nuevoEstado)) {
        throw new Error(`Transición inválida: ${this.estado} → ${nuevoEstado}`);
    }
    const previousState = this.estado;
    this.estado = nuevoEstado;
    if (nuevoEstado === ORDER_STATUS[3] && !this.fechaFinReal) {
        this.fechaFinReal = new Date();
    }
    if (nuevoEstado === ORDER_STATUS[3]) {
        this.metricas.sla.cumplido = this.cumpleSLA();
    }
    const lastEntry = this.historialEstados[this.historialEstados.length - 1];
    const duracion = lastEntry ? (new Date().getTime() - lastEntry.fecha.getTime()) / (1000 * 60 * 60) : 0;
    this.historialEstados.push({
        estadoAnterior: previousState,
        estadoNuevo: nuevoEstado,
        cambiadoPor: userId,
        comentario,
        fecha: new Date(),
        duracionEnEstado: duracion,
    });
    this.historial.push({
        accion: 'Cambio de estado',
        usuario: userId,
        detalles: { from: previousState, to: nuevoEstado, comentario },
        fecha: new Date(),
    });
    return this.save();
};
orderSchema.methods.agregarNota = async function (contenido, autorId) {
    this.notas.push({ contenido, autor: autorId, createdAt: new Date() });
    this.historial.push({
        accion: 'Nota agregada',
        usuario: autorId,
        detalles: { contenido: contenido.substring(0, 100) + '...' },
        fecha: new Date(),
    });
    return this.save();
};
orderSchema.methods.cumpleSLA = function () {
    if (!this.metricas?.sla?.fechaLimite)
        return true;
    const fin = this.fechaFinReal || new Date();
    return fin <= this.metricas.sla.fechaLimite;
};
orderSchema.methods.tiempoRestanteSLA = function () {
    if (!this.metricas?.sla?.fechaLimite)
        return null;
    const diff = this.metricas.sla.fechaLimite.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60));
};
orderSchema.statics.findActive = function (options = {}) {
    const { page = 1, limit = 20 } = options;
    return this.find({ isActive: true, isArchived: false })
        .sort({ fechaInicio: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('asignadoA supervisorId', 'nombre email')
        .lean();
};
orderSchema.statics.findByStatus = function (status, options = {}) {
    const { page = 1, limit = 20 } = options;
    return this.find({ estado: status, isActive: true })
        .sort({ fechaInicio: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
};
orderSchema.statics.findCurrentMonth = function (options = {}) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const { page = 1, limit = 20 } = options;
    return this.find({
        fechaInicio: { $gte: start, $lte: end },
        isActive: true,
    }).sort({ fechaInicio: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
};
orderSchema.statics.findVencidas = function (options = {}) {
    const now = new Date();
    const { limit = 50 } = options;
    return this.find({
        fechaFinEstimada: { $lt: now },
        fechaFinReal: { $exists: false },
        isActive: true,
        estado: { $nin: [ORDER_STATUS[3], ORDER_STATUS[7], ORDER_STATUS[6]] },
    }).sort({ fechaFinEstimada: 1 })
        .limit(limit)
        .lean();
};
orderSchema.statics.findProximasAVencer = function (dias = 7, options = {}) {
    const now = new Date();
    const limite = new Date(now.getTime() + dias * 24 * 60 * 60 * 1000);
    const { limit = 50 } = options;
    return this.find({
        fechaFinEstimada: { $gte: now, $lte: limite },
        fechaFinReal: { $exists: false },
        isActive: true,
        estado: { $nin: [ORDER_STATUS[3], ORDER_STATUS[7], ORDER_STATUS[6]] },
    }).sort({ fechaFinEstimada: 1 })
        .limit(limit)
        .lean();
};
orderSchema.statics.search = function (query, options = {}) {
    const { page = 1, limit = 20 } = options;
    return this.find({ $text: { $search: `"${query}"` }, isActive: true }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' }, fechaInicio: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
};
orderSchema.statics.getEstadisticas = async function () {
    const match = { isActive: true, isArchived: false };
    return this.aggregate([
        { $match: match },
        {
            $facet: {
                porEstado: [
                    { $group: { _id: '$estado', count: { $sum: 1 }, costoTotal: { $sum: '$costoReal' } } },
                ],
                porPrioridad: [
                    { $group: { _id: '$prioridad', count: { $sum: 1 } } },
                ],
                vencidas: [
                    { $match: { fechaFinEstimada: { $lt: new Date() }, fechaFinReal: { $exists: false }, estado: { $nin: [ORDER_STATUS[3], ORDER_STATUS[7]] } } },
                    { $count: 'total' },
                ],
                proximasAVencer: [
                    {
                        $match: {
                            fechaFinEstimada: {
                                $gte: new Date(),
                                $lte: { $add: [new Date(), 7 * 24 * 60 * 60 * 1000] },
                            },
                            fechaFinReal: { $exists: false },
                        },
                    },
                    { $count: 'total' },
                ],
                metricas: [
                    {
                        $group: {
                            _id: null,
                            totalOrdenes: { $sum: 1 },
                            costoEstimadoTotal: { $sum: '$costoEstimado' },
                            costoRealTotal: { $sum: '$costoReal' },
                            duracionPromedio: { $avg: '$metricas.duracionRealDias' },
                            slasCumplidos: { $sum: { $cond: [{ $eq: ['$metricas.sla.cumplido', true] }, 1, 0] } },
                        },
                    },
                ],
            },
        },
    ]).then(results => results[0] || {});
};
orderSchema.statics.findByCliente = function (clienteNombre, options = {}) {
    const { page = 1, limit = 20 } = options;
    return this.find({
        clienteNombre: { $regex: clienteNombre, $options: 'i' },
        isActive: true,
    }).sort({ fechaInicio: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
};
orderSchema.statics.findAsignadasA = function (userId, options = {}) {
    const { limit = 50 } = options;
    return this.find({
        asignadoA: userId,
        isActive: true,
        estado: { $nin: [ORDER_STATUS[3], ORDER_STATUS[7], ORDER_STATUS[6]] },
    }).sort({ prioridad: -1, fechaFinEstimada: 1 })
        .limit(limit)
        .populate('supervisorId', 'nombre')
        .lean();
};
const Order = mongoose.model('Order', orderSchema);
export default Order;
//# sourceMappingURL=Order.js.map