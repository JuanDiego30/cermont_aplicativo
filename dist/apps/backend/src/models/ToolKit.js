import mongoose, { Schema } from 'mongoose';
import { TOOLKIT_CATEGORIES } from '';
import { logger } from '';
import AuditLog from '';
const ItemSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'Nombre requerido'],
        trim: true,
        maxlength: [100, 'Nombre máximo 100 caracteres'],
    },
    cantidad: {
        type: Number,
        required: [true, 'Cantidad requerida'],
        min: [1, 'Cantidad mínima 1'],
        max: [100, 'Cantidad máxima 100'],
    },
    descripcion: { type: String, trim: true, maxlength: [200] },
    esencial: { type: Boolean, default: false },
    requiereCertificacion: { type: Boolean, default: false },
}, { _id: true });
const toolKitSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'Nombre requerido'],
        unique: true,
        trim: true,
        uppercase: false,
        maxlength: [100],
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [500],
    },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: [50] }],
    categoria: {
        type: String,
        required: [true, 'Categoría requerida'],
        enum: TOOLKIT_CATEGORIES,
    },
    herramientas: [ItemSchema],
    equipos: [ItemSchema],
    elementosSeguridad: [ItemSchema],
    isActive: { type: Boolean, default: true, index: true },
    creadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creador requerido'],
        index: true,
    },
    vecesUtilizado: { type: Number, default: 0, min: 0 },
    ultimaUso: { type: Date },
    ordersUsedIn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    version: { type: Number, default: 1 },
}, {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
    strict: true,
    collection: 'toolkits',
});
toolKitSchema.index({ nombre: 1, isActive: 1 });
toolKitSchema.index({ categoria: 1, vecesUtilizado: -1 });
toolKitSchema.index({ creadoPor: 1, isActive: 1 });
toolKitSchema.index({ tags: 1 });
toolKitSchema.index({ ultimaUso: -1 });
toolKitSchema.index({
    nombre: 'text',
    descripcion: 'text',
    tags: 'text',
});
toolKitSchema.virtual('totalItems').get(function () {
    const h = this.herramientas.reduce((sum, i) => sum + (i.cantidad || 0), 0);
    const e = this.equipos.reduce((sum, i) => sum + (i.cantidad || 0), 0);
    const s = this.elementosSeguridad.reduce((sum, i) => sum + (i.cantidad || 0), 0);
    return h + e + s;
});
toolKitSchema.virtual('herramientasEsenciales').get(function () {
    return this.herramientas.filter(h => h.esencial);
});
toolKitSchema.virtual('equiposConCertificacion').get(function () {
    return this.equipos.filter(e => e.requiereCertificacion);
});
toolKitSchema.virtual('totalEsenciales').get(function () {
    return this.herramientasEsenciales.reduce((sum, h) => sum + h.cantidad, 0);
});
toolKitSchema.virtual('requiereCertificacion').get(function () {
    return this.equiposConCertificacion.length > 0;
});
toolKitSchema.pre('save', function (next) {
    if (this.herramientas.length === 0 && this.equipos.length === 0 && this.elementosSeguridad.length === 0) {
        return next(new Error('Al menos un item requerido en herramientas, equipos o seguridad'));
    }
    if (this.tags && this.isModified('tags')) {
        const uniqueTags = [...new Set(this.tags.map(t => t.toLowerCase().trim()))].filter(t => t);
        this.tags = uniqueTags;
    }
    if (!this.isNew && this.isModified(['herramientas', 'equipos', 'elementosSeguridad'])) {
        this.version += 1;
    }
    next();
});
toolKitSchema.post('save', async function (doc, next) {
    try {
        const action = doc.isNew ? 'CREATE_TOOLKIT' : 'UPDATE_TOOLKIT';
        await AuditLog.log({
            userId: doc.creadoPor,
            action,
            resource: 'ToolKit',
            resourceId: doc._id,
            description: doc.isNew ? `Kit creado: ${doc.nombre}` : `Kit actualizado: ${doc.nombre}`,
            metadata: {
                categoria: doc.categoria,
                totalItems: doc.totalItems,
                version: doc.version,
            },
            status: 'SUCCESS',
            severity: 'LOW',
        });
    }
    catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Audit error';
        logger.error('[ToolKit] Audit failed', { error: errMsg, kitId: doc._id });
    }
    next();
});
toolKitSchema.methods.incrementUsage = async function (orderId, userId) {
    this.vecesUtilizado += 1;
    this.ultimaUso = new Date();
    if (orderId && !this.ordersUsedIn.includes(orderId)) {
        this.ordersUsedIn.push(orderId);
    }
    await this.save();
    await AuditLog.log({
        userId,
        action: 'USE_TOOLKIT',
        resource: 'ToolKit',
        resourceId: this._id,
        description: `Kit utilizado: ${this.nombre} (total usos: ${this.vecesUtilizado})`,
        metadata: { orderId, categoria: this.categoria },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    return this;
};
toolKitSchema.methods.clone = async function (newName, clonerId) {
    if (!newName || newName === this.nombre) {
        throw new Error('Nuevo nombre requerido y único');
    }
    const existing = await this.constructor.findOne({ nombre: newName });
    if (existing)
        throw new Error('Nombre ya existe');
    const ToolKitModel = this.constructor;
    const cloneData = {
        nombre: newName,
        descripcion: `Copia de ${this.nombre}`,
        categoria: this.categoria,
        tags: this.tags,
        herramientas: this.herramientas.map(h => ({ ...h.toObject(), _id: undefined })),
        equipos: this.equipos.map(e => ({ ...e.toObject(), _id: undefined })),
        elementosSeguridad: this.elementosSeguridad.map(s => ({ ...s.toObject(), _id: undefined })),
        creadoPor: clonerId,
        version: 1,
    };
    const clone = await ToolKitModel.create(cloneData);
    await AuditLog.log({
        userId: clonerId,
        action: 'CLONE_TOOLKIT',
        resource: 'ToolKit',
        resourceId: clone._id,
        description: `Kit clonado: ${newName} desde ${this.nombre}`,
        metadata: { originalId: this._id, totalItems: clone.totalItems },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    return clone;
};
toolKitSchema.methods.isSufficientForOrder = function (orderCategoria) {
    const essentials = this.totalEsenciales;
    return this.categoria === orderCategoria && essentials > 0;
};
toolKitSchema.statics.findByCategory = function (category, options = {}) {
    const { page = 1, limit = 20, sort = { vecesUtilizado: -1 } } = options;
    const skip = (page - 1) * limit;
    return this.find({ categoria: category, isActive: true })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('creadoPor', 'nombre email')
        .select('nombre descripcion categoria totalItems herramientasEsenciales.length equiposConCertificacion.length')
        .lean();
};
toolKitSchema.statics.getMostUsed = function (limit = 10, options = {}) {
    const { categoria = undefined } = options;
    const match = { isActive: true };
    if (categoria)
        match.categoria = categoria;
    return this.find(match)
        .sort({ vecesUtilizado: -1, ultimaUso: -1 })
        .limit(limit)
        .lean();
};
toolKitSchema.statics.search = function (query, options = {}) {
    const { page = 1, limit = 20 } = options;
    return this.find({ $text: { $search: query }, isActive: true }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
};
toolKitSchema.statics.getForOrder = function (orderId, orderCategoria) {
    return this.find({ categoria: orderCategoria, isActive: true })
        .sort({ vecesUtilizado: -1 })
        .populate('ordersUsedIn', 'numeroOrden estado')
        .lean();
};
toolKitSchema.statics.getStatsByCategory = async function () {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$categoria',
                totalKits: { $sum: 1 },
                totalItems: { $sum: '$totalItems' },
                avgUsage: { $avg: '$vecesUtilizado' },
                mostUsed: { $first: '$nombre' },
            },
        },
        { $sort: { totalKits: -1 } },
    ]);
};
const ToolKit = mongoose.model('ToolKit', toolKitSchema);
export default ToolKit;
//# sourceMappingURL=ToolKit.js.map