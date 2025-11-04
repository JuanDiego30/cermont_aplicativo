import mongoose, { Schema } from 'mongoose';
import { WORKPLAN_STATUS, BUSINESS_UNITS, ORDER_PRIORITY } from '../utils/constants';
const RISK_LEVELS = ['bajo', 'medio', 'alto', 'critico'];
import { logger } from '../utils/logger';
import AuditLog from './AuditLog';
const MaterialSchema = new Schema({
    descripcion: { type: String, required: [true, 'Descripción requerida'], trim: true, maxlength: [200] },
    cantidad: { type: Number, required: [true, 'Cantidad requerida'], min: [0], max: [1000] },
    unidad: { type: String, default: 'und', trim: true, maxlength: [10] },
    proveedor: { type: String, trim: true, maxlength: [100] },
    costo: { type: Number, min: [0], default: 0 },
    solicitado: { type: Boolean, default: false },
    recibido: { type: Boolean, default: false },
    fechaSolicitud: { type: Date },
    fechaRecepcion: { type: Date },
}, { _id: true });
const HerramientaSchema = new Schema({
    descripcion: { type: String, required: [true, 'Descripción requerida'], trim: true, maxlength: [200] },
    cantidad: { type: Number, required: [true, 'Cantidad requerida'], min: [1], max: [50] },
    disponible: { type: Boolean, default: true },
    ubicacion: { type: String, trim: true, maxlength: [100] },
    toolkitId: { type: mongoose.Schema.Types.ObjectId, ref: 'ToolKit' },
}, { _id: true });
const EquipoSchema = new Schema({
    descripcion: { type: String, required: [true, 'Descripción requerida'], trim: true, maxlength: [200] },
    cantidad: { type: Number, required: [true, 'Cantidad requerida'], min: [1], max: [20] },
    certificado: {
        numero: { type: String, trim: true, maxlength: [50] },
        vigencia: { type: Date },
        vencido: { type: Boolean, default: false },
    },
}, { _id: true });
const ElementoSeguridadSchema = new Schema({
    descripcion: { type: String, required: [true, 'Descripción requerida'], trim: true, maxlength: [200] },
    cantidad: { type: Number, required: [true, 'Cantidad requerida'], min: [1], max: [50] },
    categoria: { type: String, enum: ['EPP', 'Señalización', 'Protección colectiva', 'Emergencia', 'Otro'], default: 'EPP' },
}, { _id: true });
const ActividadSchema = new Schema({
    actividad: { type: String, required: [true, 'Actividad requerida'], trim: true, maxlength: [300] },
    fechaInicio: { type: Date, required: [true, 'Fecha inicio requerida'] },
    fechaFin: { type: Date, required: [true, 'Fecha fin requerida'] },
    responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completada: { type: Boolean, default: false },
    fechaCompletada: { type: Date },
    duracionReal: { type: Number, min: [0] },
    observaciones: { type: String, trim: true, maxlength: [500] },
}, { _id: true });
const AprobacionSchema = new Schema({
    aprobadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Aprobador requerido'] },
    rol: { type: String, enum: ['engineer', 'coordinator_hes', 'admin'], required: [true, 'Rol requerido'] },
    aprobado: { type: Boolean, required: [true, 'Estado requerido'] },
    comentarios: { type: String, trim: true, maxlength: [500] },
    fecha: { type: Date, default: Date.now },
}, { _id: true });
const RiesgoSchema = new Schema({
    descripcion: { type: String, required: [true, 'Descripción requerida'], trim: true, maxlength: [500] },
    nivel: { type: String, enum: RISK_LEVELS, default: 'medio' },
    medidaControl: { type: String, trim: true, maxlength: [500] },
    responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });
const ArchivoSchema = new Schema({
    nombre: { type: String, required: [true, 'Nombre requerido'], trim: true, maxlength: [200] },
    url: { type: String, required: [true, 'URL requerida'], maxlength: [500] },
    tipo: { type: String, trim: true, maxlength: [50] },
    categoria: { type: String, enum: ['plano', 'certificado', 'cotizacion', 'foto', 'otro'], default: 'otro' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
}, { _id: true });
const workPlanSchema = new Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order ID requerido'],
        unique: true,
        index: true,
    },
    titulo: { type: String, required: [true, 'Título requerido'], trim: true, maxlength: [200] },
    descripcion: { type: String, trim: true, maxlength: [1000] },
    alcance: { type: String, required: [true, 'Alcance requerido'], trim: true, maxlength: [3000] },
    unidadNegocio: { type: String, enum: BUSINESS_UNITS, required: [true, 'Unidad requerida'] },
    responsables: {
        ingResidente: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        tecnicoElectricista: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        hes: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Creador requerido'], index: true },
    materiales: [MaterialSchema],
    herramientas: [HerramientaSchema],
    equipos: [EquipoSchema],
    elementosSeguridad: [ElementoSeguridadSchema],
    personalRequerido: {
        electricistas: { type: Number, default: 0, min: 0, max: [20] },
        tecnicosTelecomunicacion: { type: Number, default: 0, min: 0, max: [20] },
        instrumentistas: { type: Number, default: 0, min: 0, max: [20] },
        obreros: { type: Number, default: 0, min: 0, max: [20] },
    },
    cronograma: [ActividadSchema],
    estado: { type: String, enum: WORKPLAN_STATUS, default: WORKPLAN_STATUS[0] },
    aprobaciones: [AprobacionSchema],
    aprobadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fechaAprobacion: { type: Date },
    observaciones: { type: String, trim: true, maxlength: [2000] },
    riesgos: [RiesgoSchema],
    metricas: {
        costoTotalEstimado: { type: Number, default: 0, min: [0] },
        duracionTotalDias: { type: Number, default: 0, min: [0] },
        porcentajeCompletado: { type: Number, default: 0, min: [0], max: [100] },
        materialesCompletos: { type: Boolean, default: false },
        herramientasCompletas: { type: Boolean, default: false },
    },
    archivos: [ArchivoSchema],
    requiereRevision: { type: Boolean, default: false },
    prioridad: { type: String, enum: ORDER_PRIORITY, default: 'media' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
    strict: true,
    collection: 'workplans',
});
workPlanSchema.index({ orderId: 1, estado: 1 });
workPlanSchema.index({ estado: 1, createdAt: -1 });
workPlanSchema.index({ unidadNegocio: 1, estado: 1 });
workPlanSchema.index({ prioridad: 1, estado: 1 });
workPlanSchema.index({ 'responsables.ingResidente': 1 });
workPlanSchema.index({ creadoPor: 1, estado: 1 });
workPlanSchema.index({ 'riesgos.nivel': 1 });
workPlanSchema.index({ titulo: 'text', descripcion: 'text', alcance: 'text', 'riesgos.descripcion': 'text' });
workPlanSchema.virtual('costoTotalMateriales').get(function () {
    return this.materiales.reduce((total, m) => total + ((m.costo || 0) * (m.cantidad || 0)), 0);
});
workPlanSchema.virtual('totalPersonal').get(function () {
    const p = this.personalRequerido;
    return (p.electricistas || 0) + (p.tecnicosTelecomunicacion || 0) + (p.instrumentistas || 0) + (p.obreros || 0);
});
workPlanSchema.virtual('progresoActividades').get(function () {
    if (this.cronograma.length === 0)
        return 0;
    const completed = this.cronograma.filter(a => a.completada).length;
    return Math.round((completed / this.cronograma.length) * 100);
});
workPlanSchema.virtual('estaAprobado').get(function () {
    return this.estado === WORKPLAN_STATUS[1];
});
workPlanSchema.virtual('totalHerramientas').get(function () {
    return this.herramientas.reduce((sum, h) => sum + (h.cantidad || 0), 0);
});
workPlanSchema.virtual('totalEquipos').get(function () {
    return this.equipos.reduce((sum, e) => sum + (e.cantidad || 0), 0);
});
workPlanSchema.virtual('materialesRecibidos').get(function () {
    if (this.materiales.length === 0)
        return 0;
    const received = this.materiales.filter(m => m.recibido).length;
    return Math.round((received / this.materiales.length) * 100);
});
workPlanSchema.virtual('tieneCertificadosVencidos').get(function () {
    const now = new Date();
    return this.equipos.some(e => e.certificado?.vigencia && e.certificado.vigencia < now);
});
workPlanSchema.virtual('duracionTotal').get(function () {
    if (this.cronograma.length === 0)
        return 0;
    const starts = this.cronograma.map(a => new Date(a.fechaInicio).getTime());
    const ends = this.cronograma.map(a => new Date(a.fechaFin).getTime());
    const start = Math.min(...starts);
    const end = Math.max(...ends);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});
workPlanSchema.pre('save', function (next) {
    this.metricas.costoTotalEstimado = this.costoTotalMateriales;
    this.metricas.duracionTotalDias = this.duracionTotal;
    this.metricas.porcentajeCompletado = this.progresoActividades;
    this.metricas.materialesCompletos = this.materiales.length > 0 && this.materiales.every(m => m.recibido);
    this.metricas.herramientasCompletas = this.herramientas.length > 0 && this.herramientas.every(h => h.disponible);
    const now = new Date();
    this.equipos.forEach((e) => {
        if (e.certificado?.vigencia)
            e.certificado.vencido = e.certificado.vigencia < now;
    });
    if (this.cronograma.some((a) => new Date(a.fechaFin) <= new Date(a.fechaInicio))) {
        return next(new Error('Fecha fin debe ser posterior a inicio'));
    }
    if (this.isModified() && !this.isNew)
        this.updatedBy = this.updatedBy || this.creadoPor;
    if (this.isModified('estado') && !this.isNew) {
        logger.info(`WorkPlan ${this._id} estado changed to ${this.estado}`);
    }
    next();
});
workPlanSchema.post('save', async function (doc, next) {
    try {
        const action = doc.isNew ? 'CREATE_WORKPLAN' : 'UPDATE_WORKPLAN';
        const description = doc.isNew ? `Plan creado para order ${doc.orderId}: ${doc.titulo}` : `Plan actualizado: ${doc.titulo}`;
        const metadata = {
            orderId: doc.orderId,
            estado: doc.estado,
            prioridad: doc.prioridad,
            progreso: doc.metricas.porcentajeCompletado,
            costo: doc.metricas.costoTotalEstimado,
        };
        await AuditLog.log({
            userId: doc.creadoPor || doc.updatedBy,
            action,
            resource: 'WorkPlan',
            resourceId: doc._id,
            description,
            metadata,
            status: 'SUCCESS',
            severity: doc.isModified('estado') || doc.aprobaciones.length > 0 ? 'MEDIUM' : 'LOW',
        });
    }
    catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Audit error';
        logger.error('[WorkPlan] Audit failed', { error: errMsg, planId: doc._id });
    }
    next();
});
workPlanSchema.methods.completeActivity = async function (activityId, userId) {
    const activity = this.cronograma.id(activityId);
    if (!activity || activity.completada)
        return this;
    activity.completada = true;
    activity.fechaCompletada = new Date();
    const duration = activity.fechaCompletada.getTime() - new Date(activity.fechaInicio).getTime();
    activity.duracionReal = Math.round(duration / (1000 * 60 * 60));
    await this.save();
    await AuditLog.log({
        userId,
        action: 'UPDATE',
        resource: 'WorkPlan',
        resourceId: this._id,
        description: `Actividad completada: ${activity.actividad}`,
        metadata: { activityId, duracionReal: activity.duracionReal },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    logger.info(`Activity ${activityId} completed in plan ${this._id}`);
    return this;
};
workPlanSchema.methods.aprobar = async function (userId, rol, comentarios = '') {
    if (!['engineer', 'coordinator_hes', 'admin'].includes(rol)) {
        throw new Error('Rol no autorizado para aprobación');
    }
    this.aprobaciones.push({
        aprobadoPor: userId,
        rol,
        aprobado: true,
        comentarios,
        fecha: new Date(),
    });
    const requiredRoles = ['engineer', 'coordinator_hes'];
    const approvedRoles = this.aprobaciones.filter(a => a.aprobado).map(a => a.rol);
    if (requiredRoles.every(r => approvedRoles.includes(r))) {
        this.estado = WORKPLAN_STATUS[1];
        this.aprobadoPor = userId;
        this.fechaAprobacion = new Date();
        this.requiereRevision = false;
    }
    await this.save();
    await AuditLog.log({
        userId,
        action: 'APPROVE_WORKPLAN',
        resource: 'WorkPlan',
        resourceId: this._id,
        description: `Plan aprobado por ${rol}: ${this.titulo}`,
        metadata: { rol, comentarios, totalAprobaciones: this.aprobaciones.length },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    logger.info(`WorkPlan ${this._id} approved by ${userId}`);
    return this;
};
workPlanSchema.methods.rechazar = async function (userId, rol, comentarios) {
    if (!['engineer', 'coordinator_hes', 'admin'].includes(rol)) {
        throw new Error('Rol no autorizado para rechazo');
    }
    this.aprobaciones.push({
        aprobadoPor: userId,
        rol,
        aprobado: false,
        comentarios,
        fecha: new Date(),
    });
    this.estado = WORKPLAN_STATUS[0];
    this.requiereRevision = true;
    await this.save();
    await AuditLog.log({
        userId,
        action: 'REJECT_WORKPLAN',
        resource: 'WorkPlan',
        resourceId: this._id,
        description: `Plan rechazado por ${rol}: ${this.titulo}`,
        metadata: { rol, comentarios },
        status: 'WARNING',
        severity: 'MEDIUM',
    });
    logger.warn(`WorkPlan ${this._id} rejected: ${comentarios}`);
    return this;
};
workPlanSchema.methods.verificarRecursos = function () {
    const faltantes = {
        materiales: this.materiales.filter(m => !m.recibido),
        herramientas: this.herramientas.filter(h => !h.disponible),
        equiposSinCert: this.equipos.filter(e => !e.certificado?.numero),
        certVencidos: this.equipos.filter(e => e.certificado?.vencido),
    };
    const todoListo = faltantes.materiales.length === 0 &&
        faltantes.herramientas.length === 0 &&
        faltantes.equiposSinCert.length === 0 &&
        faltantes.certVencidos.length === 0;
    return { todoListo, faltantes };
};
workPlanSchema.methods.getProximasActividades = function (dias = 7) {
    const now = new Date();
    const limit = new Date(now.getTime() + dias * 24 * 60 * 60 * 1000);
    return this.cronograma
        .filter(a => !a.completada && new Date(a.fechaInicio) >= now && new Date(a.fechaInicio) <= limit)
        .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
};
workPlanSchema.statics.findByStatus = function (status, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    return this.find({ estado: status })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('creadoPor', 'nombre apellido')
        .select('-materiales -equipos -elementosSeguridad')
        .lean();
};
workPlanSchema.statics.findPendingApproval = function (options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    return this.find({ estado: WORKPLAN_STATUS[0], requiereRevision: { $ne: true } })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('responsables', 'nombre apellido')
        .lean();
};
workPlanSchema.statics.findByOrder = function (orderId) {
    return this.findOne({ orderId })
        .populate('responsables', 'nombre apellido rol')
        .populate('orderId', 'numeroOrden estado');
};
workPlanSchema.statics.findByResponsable = function (userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    return this.find({
        $or: [
            { 'responsables.ingResidente': userId },
            { 'responsables.tecnicoElectricista': userId },
            { 'responsables.hes': userId },
            { creadoPor: userId },
        ],
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('orderId', 'numeroOrden')
        .lean();
};
workPlanSchema.statics.findByUnidad = function (unidad, options = {}) {
    const { estado = { $ne: WORKPLAN_STATUS[0] }, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    return this.find({ unidadNegocio: unidad, estado })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
workPlanSchema.statics.search = function (query, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    return this.find({ $text: { $search: `"${query}"` } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
workPlanSchema.statics.getEstadisticas = async function () {
    return this.aggregate([
        { $match: { estado: { $ne: WORKPLAN_STATUS[0] } } },
        {
            $group: {
                _id: { estado: '$estado', unidadNegocio: '$unidadNegocio' },
                count: { $sum: 1 },
                costoPromedio: { $avg: '$metricas.costoTotalEstimado' },
                duracionPromedio: { $avg: '$metricas.duracionTotalDias' },
                avgProgreso: { $avg: '$metricas.porcentajeCompletado' },
            },
        },
        { $sort: { '_id.unidadNegocio': 1, count: -1 } },
    ]);
};
workPlanSchema.statics.getByPrioridad = function (prioridad) {
    return this.find({ prioridad, estado: { $in: [WORKPLAN_STATUS[1], 'IN_PROGRESS'] } })
        .populate('orderId')
        .sort({ createdAt: -1 })
        .lean();
};
const WorkPlan = mongoose.model('WorkPlan', workPlanSchema);
export default WorkPlan;
//# sourceMappingURL=WorkPlan.js.map