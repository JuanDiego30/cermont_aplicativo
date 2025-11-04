import mongoose, { Schema } from 'mongoose';
import { EVIDENCE_TYPES } from '../utils/constants';
import { logger } from '../utils/logger';
import AuditLog from './AuditLog';
const CATEGORIAS = ['foto', 'documento', 'video', 'otros'];
const STATUSES = ['UPLOADED', 'VERIFIED', 'REJECTED'];
const MIME_TYPES = [
    'image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'application/octet-stream',
];
const ArchivoSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'Nombre de archivo requerido'],
        trim: true,
        maxlength: [255, 'Nombre de archivo demasiado largo'],
    },
    url: {
        type: String,
        required: [true, 'URL de archivo requerida'],
        trim: true,
        validate: {
            validator: (v) => /^https?:\/\//.test(v) || /^\/uploads\//.test(v),
            message: 'URL inválida',
        },
    },
    mimeType: {
        type: String,
        required: [true, 'MIME type requerido'],
        enum: MIME_TYPES,
        trim: true,
    },
    tamaño: {
        type: Number,
        required: [true, 'Tamaño requerido'],
        min: [1, 'Tamaño debe ser >0'],
        max: [50 * 1024 * 1024, 'Archivo máximo 50MB'],
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: true });
const evidenceSchema = new Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'ID de orden requerido'],
        index: true,
    },
    tipo: {
        type: String,
        required: [true, 'Tipo requerido'],
        enum: {
            values: Object.values(EVIDENCE_TYPES),
            message: 'Tipo inválido; debe ser uno de EVIDENCE_TYPES',
        },
        index: true,
    },
    categoria: {
        type: String,
        enum: CATEGORIAS,
        default: 'foto',
        index: true,
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [500, 'Descripción máxima 500 caracteres'],
        required: [true, 'Descripción requerida'],
    },
    archivos: [ArchivoSchema],
    ubicacion: {
        type: String,
        trim: true,
        maxlength: [200, 'Ubicación máxima 200 caracteres'],
    },
    coordenadas: {
        lat: {
            type: Number,
            min: [-90, 'Latitud inválida'],
            max: [90, 'Latitud inválida'],
        },
        lng: {
            type: Number,
            min: [-180, 'Longitud inválida'],
            max: [180, 'Longitud inválida'],
        },
    },
    fecha: {
        type: Date,
        default: Date.now,
        index: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuario requerido'],
        index: true,
    },
    tags: [{
            type: String,
            trim: true,
            lowercase: true,
            maxlength: [50, 'Tag demasiado largo'],
        }],
    status: {
        type: String,
        enum: STATUSES,
        default: 'UPLOADED',
        index: true,
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        sparse: true,
    },
    verifiedAt: { type: Date },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
    strict: true,
    collection: 'evidences',
});
evidenceSchema.index({ orderId: 1, tipo: 1 });
evidenceSchema.index({ orderId: 1, fecha: -1 });
evidenceSchema.index({ uploadedBy: 1, fecha: -1 });
evidenceSchema.index({ tags: 1 });
evidenceSchema.virtual('totalArchivos').get(function () {
    return this.archivos.length;
});
evidenceSchema.virtual('tamañoTotal').get(function () {
    return this.archivos.reduce((total, archivo) => total + (archivo.tamaño || 0), 0);
});
evidenceSchema.virtual('tieneUbicacion').get(function () {
    return !!(this.coordenadas?.lat && this.coordenadas?.lng);
});
evidenceSchema.virtual('estaVerificada').get(function () {
    return this.status === 'VERIFIED';
});
evidenceSchema.methods.isValid = function () {
    return this.archivos.length > 0 && this.archivos.every(arc => arc.url && arc.tamaño > 0);
};
evidenceSchema.statics.findByOrder = async function (orderId, options = {}) {
    const { page = 1, limit = 20, tipo = undefined, categoria = undefined, sort = { fecha: -1 } } = options;
    const skip = (page - 1) * limit;
    const match = { orderId };
    if (tipo)
        match.tipo = tipo;
    if (categoria)
        match.categoria = categoria;
    const [docs, total] = await Promise.all([
        this.find(match).sort(sort).skip(skip).limit(limit)
            .populate('uploadedBy', 'nombre email rol')
            .select('archivos.nombre archivos.url descripcion tipo -_id')
            .lean(),
        this.countDocuments(match),
    ]);
    return {
        docs,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        },
    };
};
evidenceSchema.statics.findByTags = async function (tags, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    const match = { tags: { $in: tags } };
    const [docs, total] = await Promise.all([
        this.find(match).sort({ fecha: -1 }).skip(skip).limit(limit).lean(),
        this.countDocuments(match),
    ]);
    return {
        docs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
};
evidenceSchema.statics.getUnverified = async function (reviewerId = null, limit = 50) {
    const match = { status: 'UPLOADED' };
    if (reviewerId)
        match.verifiedBy = reviewerId;
    return this.find(match)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('orderId uploadedBy', 'titulo nombre')
        .select('-archivos')
        .lean();
};
evidenceSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            const auditData = new AuditLog({
                userId: this.uploadedBy,
                action: 'CREATE_EVIDENCE',
                resource: 'Evidence',
                resourceId: this._id,
                description: `Evidencia subida: ${this.totalArchivos} archivos)`,
                metadata: { orderId: this.orderId, tipo: this.tipo, totalSize: this.tamañoTotal },
                status: this.isValid() ? 'SUCCESS' : 'FAILURE',
                severity: 'LOW',
            });
            await auditData.save();
        }
        else if (this.isModified('status')) {
            const auditData = new AuditLog({
                userId: this.verifiedBy,
                action: 'VERIFY_EVIDENCE',
                resource: 'Evidence',
                resourceId: this._id,
                description: `Evidencia verificada: ${this.status}`,
                metadata: { previousStatus: this._originalStatus || 'UPLOADED' },
                status: 'SUCCESS',
                severity: 'MEDIUM',
            });
            await auditData.save();
        }
    }
    catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Audit error';
        logger.error('[Evidence] Audit failed', { error: errMsg, evidenceId: this._id });
    }
    next();
});
const Evidence = mongoose.model('Evidence', evidenceSchema);
export default Evidence;
//# sourceMappingURL=Evidence.js.map