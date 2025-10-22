# 🔐 Configuración de GitHub Secrets para Deploy Automático

## ⚠️ Advertencias en VS Code

Si ves estos warnings en `deploy.yml`:

```
⚠️ Context access might be invalid: VPS_HOST
⚠️ Context access might be invalid: VPS_USER
⚠️ Context access might be invalid: VPS_KEY
```

**¡NO SON ERRORES!** Son solo advertencias de VS Code indicando que los secrets todavía no están configurados en tu repositorio de GitHub. El workflow funcionará correctamente una vez que configures los secrets.

---

## 📋 Guía Paso a Paso

### 1️⃣ Acceder a GitHub Secrets

1. Ve a tu repositorio en GitHub:
   ```
   https://github.com/JuanDiego30/cermont_aplicativo
   ```

2. Click en **"Settings"** (⚙️ en la barra superior)

3. En el menú lateral izquierdo, busca **"Secrets and variables"**

4. Click en **"Actions"**

5. Llegarás a esta página:
   ```
   https://github.com/JuanDiego30/cermont_aplicativo/settings/secrets/actions
   ```

---

### 2️⃣ Crear los 3 Secrets Requeridos

#### Secret #1: VPS_HOST

1. Click en **"New repository secret"**
2. **Name:** `VPS_HOST`
3. **Value:** La IP o dominio de tu VPS
   ```
   Ejemplos:
   - 192.168.1.100
   - cermont.example.com
   - vps.cermont.com
   ```
4. Click **"Add secret"**

---

#### Secret #2: VPS_USER

1. Click en **"New repository secret"**
2. **Name:** `VPS_USER`
3. **Value:** El usuario SSH con el que te conectas al VPS
   ```
   Ejemplos:
   - deploy
   - ubuntu
   - root (no recomendado para producción)
   ```
4. Click **"Add secret"**

---

#### Secret #3: VPS_KEY

1. **PRIMERO:** Genera o localiza tu clave privada SSH

   **Si NO tienes una clave SSH:**
   ```bash
   # En tu computadora local (PowerShell/Terminal):
   ssh-keygen -t ed25519 -C "deploy-cermont" -f ~/.ssh/cermont_deploy
   
   # Esto creará:
   # - ~/.ssh/cermont_deploy      (clave PRIVADA - para GitHub)
   # - ~/.ssh/cermont_deploy.pub  (clave PÚBLICA - para el VPS)
   ```

   **Si YA tienes una clave SSH:**
   ```bash
   # Ver tu clave privada:
   cat ~/.ssh/id_ed25519
   # o
   cat ~/.ssh/id_rsa
   ```

2. **SEGUNDO:** Copiar la clave PRIVADA completa

   En PowerShell:
   ```powershell
   Get-Content ~/.ssh/cermont_deploy | Set-Clipboard
   ```

   En Linux/Mac:
   ```bash
   cat ~/.ssh/cermont_deploy | pbcopy  # Mac
   cat ~/.ssh/cermont_deploy | xclip   # Linux
   ```

   La clave debe verse así:
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
   QyNTUxOQAAACBvVd5qKJfVLZLQ/fF9T+SfGxN8Db3qN3zQwZ5sI3M9DQAAAJAX6Jth+Cd
   ... (muchas líneas) ...
   -----END OPENSSH PRIVATE KEY-----
   ```

3. **TERCERO:** Crear el secret en GitHub

   1. Click en **"New repository secret"**
   2. **Name:** `VPS_KEY`
   3. **Value:** Pega la clave PRIVADA COMPLETA (incluyendo `-----BEGIN` y `-----END`)
   4. Click **"Add secret"**

---

### 3️⃣ Configurar la Clave Pública en el VPS

1. **Copiar la clave PÚBLICA:**
   ```bash
   cat ~/.ssh/cermont_deploy.pub
   ```

   Se verá algo así:
   ```
   ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBvVd5qKJfVLZLQ/fF9T+Sf... deploy-cermont
   ```

2. **Conectarte al VPS:**
   ```bash
   ssh usuario@tu-vps-ip
   ```

3. **Agregar la clave pública al VPS:**
   ```bash
   # Crear directorio .ssh si no existe:
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh

   # Agregar tu clave pública:
   echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBvVd5qKJfVL... deploy-cermont" >> ~/.ssh/authorized_keys

   # Configurar permisos:
   chmod 600 ~/.ssh/authorized_keys
   ```

4. **Probar la conexión desde tu computadora:**
   ```bash
   ssh -i ~/.ssh/cermont_deploy usuario@tu-vps-ip
   ```

   Si te conecta sin pedir contraseña = ✅ **¡Perfecto!**

---

## ✅ Verificar que Todo Funciona

### Paso 1: Verificar Secrets en GitHub

1. Ve a: `https://github.com/JuanDiego30/cermont_aplicativo/settings/secrets/actions`

2. Deberías ver 3 secrets:
   ```
   ✅ VPS_HOST      Updated X ago
   ✅ VPS_KEY       Updated X ago
   ✅ VPS_USER      Updated X ago
   ```

### Paso 2: Probar el Workflow

1. **Hacer un merge a main** (o hacer push directo):
   ```bash
   git checkout main
   git merge feature/09-deploy-docs-monitoring
   git push origin main
   ```

2. **Ver la ejecución en GitHub Actions:**
   ```
   https://github.com/JuanDiego30/cermont_aplicativo/actions
   ```

3. **Deberías ver:**
   ```
   ✅ build-and-test job completado
   ✅ deploy job completado (si los secrets están bien configurados)
   ```

---

## 🔧 Troubleshooting

### ❌ Error: "Permission denied (publickey)"

**Causa:** La clave pública no está en el VPS o tiene permisos incorrectos.

**Solución:**
```bash
# En el VPS:
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

---

### ❌ Error: "VPS_HOST secret not configured"

**Causa:** El secret no existe o tiene un nombre diferente.

**Solución:**
- Verifica que el nombre sea exactamente `VPS_HOST` (mayúsculas)
- Vuelve a crear el secret siguiendo los pasos arriba

---

### ❌ Error: "Could not resolve hostname"

**Causa:** `VPS_HOST` tiene un valor incorrecto.

**Solución:**
```bash
# Probar desde tu computadora si el host es accesible:
ping tu-vps-ip
ssh usuario@tu-vps-ip
```

---

### ❌ Error: "sudo: systemctl: command not found"

**Causa:** El servicio systemd no está configurado en el VPS.

**Solución:**
Ver `docs/README_DEPLOY.md` sección "Systemd Service" para crear el servicio.

---

## 📚 Recursos Adicionales

- **GitHub Docs - Encrypted Secrets:**  
  https://docs.github.com/en/actions/security-guides/encrypted-secrets

- **SSH Key Authentication:**  
  https://www.ssh.com/academy/ssh/keygen

- **Deploy Documentation:**  
  Ver `docs/README_DEPLOY.md` para la configuración completa del VPS

---

## 🎯 Checklist Final

Antes de hacer merge a `main`:

- [ ] ✅ Secret `VPS_HOST` creado en GitHub
- [ ] ✅ Secret `VPS_USER` creado en GitHub
- [ ] ✅ Secret `VPS_KEY` creado en GitHub (clave privada completa)
- [ ] ✅ Clave pública agregada a `~/.ssh/authorized_keys` en el VPS
- [ ] ✅ Permisos correctos en el VPS (`chmod 600 authorized_keys`)
- [ ] ✅ Conexión SSH probada desde tu computadora
- [ ] ✅ Directorio `/var/www/cermont` existe en el VPS
- [ ] ✅ Usuario tiene permisos para `git pull` y `npm`
- [ ] ✅ Usuario tiene permisos para `sudo systemctl restart cermont`
- [ ] ✅ Servicio systemd `cermont` configurado

---

## 💡 Nota Importante

Una vez configurados los secrets:

1. **Las advertencias en VS Code seguirán apareciendo** - esto es normal, VS Code no tiene acceso a los secrets de GitHub por seguridad.

2. **El workflow funcionará correctamente** - GitHub Actions SÍ tiene acceso a los secrets durante la ejecución.

3. **Nunca commitees** claves privadas, contraseñas o tokens directamente en el código.

---

**Última actualización:** 22 de octubre de 2025  
**Versión del proyecto:** 1.0.0
