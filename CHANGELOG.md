# CHANGELOG

**Cermont ATG** – Changelog

All notable changes to this project will be documented in this file.

---

## [1.0.0] – 2025-10-20

### ✨ Features

- **Core Application**: Full-stack Node.js + Next.js 15 application for work order management
- **Authentication**: JWT-based auth with role-based access control (admin, coordinador, tecnico, gerente, cliente)
- **Work Orders (Órdenes)**: Create, manage, and track maintenance orders with status tracking
- **Failures Catalog (Fallas)**: Comprehensive catalog of equipment failures with severity levels
- **Evidence Management**: Upload and organize photos, videos, and documents per order
- **Equipment Tracking**: Manage equipment inventory by client and location
- **Cost Tracking**: Budget and cost management per work order
- **Task Checklists**: Predefined checklists for different order types
- **Dashboard Views**: Role-specific dashboards for different user types

### 🔒 Security

- **Backend Hardening**: Express security headers (Helmet), rate limiting (100 req/15min)
- **Environment Validation**: Strict Zod schema for all environment variables
- **Request Logging**: Structured logging with Pino, request ID tracking
- **CORS Configuration**: Whitelist-based origin validation (no wildcards)
- **Password Security**: Bcrypt hashing for user passwords
- **Database**: PostgreSQL with prepared statements to prevent SQL injection

### 📊 Infrastructure & Deployment

- **GitHub Actions**: Automated CI/CD pipeline
  - Linting and type checking
  - Frontend and backend builds
  - Test execution
  - Automated SSH deployment to VPS
- **PM2 Configuration**: Process management with auto-restart and log rotation
- **systemd Service**: Linux service configuration for production
- **Nginx Reverse Proxy**: Load balancing and SSL termination
- **Health Endpoints**:
  - `GET /v1/health` – Basic availability check
  - `GET /v1/health/version` – Version info with git commit hash

### 📝 Documentation

- **README_DEPLOY.md** – Complete VPS setup and deployment guide
- **README_API.md** – Full API reference with examples
- **README_FRONTEND.md** – Frontend architecture and component guide
- **README_MONITORING.md** – Monitoring, alerting, and maintenance procedures

### 🛠 Development Tools

- **TypeScript**: Strict type checking for entire project
- **ESLint & Prettier**: Code quality and formatting
- **Playwright**: E2E testing framework
- **Zod**: Runtime schema validation
- **React Hook Form**: Efficient form management
- **Tailwind CSS**: Utility-first CSS framework

### 🐛 Bug Fixes

- Fixed API response shape consistency (removed nested data wrappers)
- Corrected role-based access permissions for coordinators
- Fixed AnimatedLogo component prop types
- Resolved TypeScript path resolution for API utilities
- Fixed unused variable warnings in logging middleware

### 🔄 Breaking Changes

None (First stable release)

---

## [0.2.0] – 2025-10-15

### ✨ Features

- **Order Management**: Full CRUD operations for work orders
- **Failure Integration**: Link failures to orders
- **Evidence Upload**: File upload infrastructure
- **Role-Based Access**: Basic permission checking

### 🔒 Security (Hardening Sprint)

- Integrated Helmet for security headers
- Added express-rate-limit middleware
- Environment validation with Zod
- Structured logging with Pino

### 🐛 Bug Fixes

- Fixed request logger type errors
- Resolved AnimatedLogo prop compatibility

---

## [0.1.0] – 2025-10-01

### ✨ Initial Release

- Project scaffolding and setup
- Database schema design
- Basic API routes
- Frontend structure with Next.js
- Authentication framework

---

## Upgrade Guide

### From v0.2.0 → v1.0.0

1. **Update environment variables**: Ensure `FRONTEND_ORIGIN` is set without wildcards
2. **Deploy changes**: Use GitHub Actions workflow or `bash ops/scripts/deploy.sh`
3. **Run database migrations**: Apply any pending schema changes
4. **Verify health endpoint**: `curl https://your-domain.com/v1/health/version`

### Breaking Changes: None

All APIs remain backward compatible.

---

## Known Issues

None reported in production.

---

## Future Roadmap

- [ ] Real-time notifications via WebSocket
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] PDF report generation
- [ ] Integration with field service schedulers
- [ ] Offline mode for technicians
- [ ] Multi-language support (i18n)
- [ ] Advanced audit logging
- [ ] Integration with external monitoring (Datadog, New Relic)

---

## Contributors

- **Lead Developer**: [Your Name]
- **QA**: [QA Name]
- **DevOps**: [DevOps Name]

---

## License

Proprietary - All rights reserved

---

## Support

For issues and questions:

1. Check the relevant documentation in `/docs`
2. Review the API reference in `docs/README_API.md`
3. Contact the development team

---

**Last Updated**: October 20, 2025  
**Next Review**: November 20, 2025
