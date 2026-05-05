# SCESA Mobile - Guía de Configuración Kotlin Multiplatform

## 📱 Aplicación Móvil SCESA para Escaneo QR y Registro de Asistencia

Esta aplicación complementa el dashboard web SCESA, permitiendo el registro de asistencia mediante:
- **Escaneo de códigos QR** con la cámara del dispositivo
- **Registro manual** por nombre y grupo del alumno

---

## 🎯 Requisitos Previos

### Software Necesario:
1. **Android Studio** (versión Hedgehog 2023.1.1 o superior)
   - Descarga: https://developer.android.com/studio
   
2. **JDK 17** o superior (incluido con Android Studio)

3. **Android SDK** con:
   - Android 8.0 (API 26) como mínimo
   - Android 14.0 (API 34) como target

### Plugins de Android Studio:
- Kotlin Multiplatform Mobile (KMM)
- Android Gradle Plugin

---

## 🚀 Paso 1: Configurar Android Studio

### 1.1 Instalar Plugin de Kotlin Multiplatform:

1. Abre Android Studio
2. Ve a: **File → Settings** (Windows/Linux) o **Android Studio → Preferences** (Mac)
3. Navega a: **Plugins**
4. Busca: **"Kotlin Multiplatform Mobile"**
5. Haz clic en **Install**
6. Reinicia Android Studio

### 1.2 Verificar SDK de Android:

1. Ve a: **File → Settings → Appearance & Behavior → System Settings → Android SDK**
2. En la pestaña **SDK Platforms**, asegúrate de tener instalado:
   - Android 14.0 (API 34) ✓
   - Android 8.0 (API 26) ✓
3. En la pestaña **SDK Tools**, verifica:
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android Emulator
   - Google Play services

---

## 📦 Paso 2: Crear Estructura del Proyecto KMP

### 2.1 Crear nuevo proyecto:

1. Abre Android Studio
2. Selecciona: **File → New → Project...**
3. Selecciona: **Kotlin Multiplatform App**
4. Configura:
   - **Name:** SCESA-Mobile
   - **Package name:** mx.cetis24.scesa.mobile
   - **Save location:** [Tu directorio preferido]
   - **Minimum SDK:** API 26 (Android 8.0)
5. Haz clic en **Finish**

### 2.2 Estructura de Carpetas:

```
SCESA-Mobile/
├── androidApp/              # Código específico de Android
│   ├── src/
│   │   └── main/
│   │       ├── java/mx/cetis24/scesa/mobile/
│   │       ├── res/
│   │       │   ├── drawable/     # Aquí va logooriginal.jpg
│   │       │   ├── layout/
│   │       │   ├── values/
│   │       │   │   ├── colors.xml
│   │       │   │   ├── strings.xml
│   │       │   │   └── themes.xml
│   │       └── AndroidManifest.xml
│   └── build.gradle.kts
│
├── shared/                  # Código compartido multiplataforma
│   ├── src/
│   │   ├── commonMain/      # Código común
│   │   │   └── kotlin/
│   │   └── androidMain/     # Código Android específico
│   │       └── kotlin/
│   └── build.gradle.kts
│
├── build.gradle.kts
└── settings.gradle.kts
```

---

## 🎨 Paso 3: Configurar Diseño Institucional

### 3.1 Agregar el Logo Oficial:

1. Localiza tu archivo **logooriginal.jpg** en tu computadora
2. En Android Studio:
   - Haz clic derecho en: `androidApp/src/main/res/drawable`
   - Selecciona: **Show in Explorer** (Windows) o **Reveal in Finder** (Mac)
   - Copia **logooriginal.jpg** en esa carpeta
3. Renombra el archivo a: **logo_cetis24.jpg** (minúsculas, sin espacios)

### 3.2 Definir Colores Institucionales:

Edita el archivo: `androidApp/src/main/res/values/colors.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Colores Institucionales CETIS 24 -->
    <color name="primary_blue">#1A3A5C</color>
    <color name="secondary_blue">#2E6DA4</color>
    <color name="background_light">#F5F7FA</color>
    
    <!-- Colores de Estado -->
    <color name="success_green">#10B981</color>
    <color name="error_red">#EF4444</color>
    <color name="warning_yellow">#F59E0B</color>
    
    <!-- Colores de Texto -->
    <color name="text_primary">#1E1E1E</color>
    <color name="text_secondary">#6B7280</color>
    <color name="text_white">#FFFFFF</color>
    
    <!-- Colores de UI -->
    <color name="border_gray">#E5E7EB</color>
    <color name="card_background">#FFFFFF</color>
</resources>
```

### 3.3 Configurar Strings:

Edita: `androidApp/src/main/res/values/strings.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">SCESA Mobile</string>
    <string name="app_full_name">Sistema de Control de Entradas y Salidas</string>
    <string name="institution_name">CETIS 24</string>
    
    <!-- Login -->
    <string name="login_title">Iniciar Sesión</string>
    <string name="username_hint">Usuario</string>
    <string name="password_hint">Contraseña</string>
    <string name="login_button">Ingresar</string>
    
    <!-- Menú Principal -->
    <string name="main_menu_title">Menú Principal</string>
    <string name="qr_scan_title">Escaneo QR</string>
    <string name="qr_scan_description">Registrar entrada/salida con código QR</string>
    <string name="manual_register_title">Registro Manual</string>
    <string name="manual_register_description">Buscar alumno por nombre y grupo</string>
    
    <!-- Escaneo QR -->
    <string name="qr_scan_instructions">Enfoca el código QR de la credencial</string>
    <string name="qr_scan_success">Registro exitoso</string>
    <string name="qr_scan_error">Error al escanear QR</string>
    
    <!-- Registro Manual -->
    <string name="search_student">Buscar alumno</string>
    <string name="student_name_hint">Nombre del alumno</string>
    <string name="group_hint">Grupo</string>
    <string name="register_entry">Registrar Entrada</string>
    <string name="register_exit">Registrar Salida</string>
    
    <!-- Permisos -->
    <string name="camera_permission_required">Se requiere acceso a la cámara para escanear códigos QR</string>
</resources>
```

---

## 📝 Paso 4: Configurar Dependencies

### 4.1 Editar `build.gradle.kts` del proyecto:

```kotlin
// build.gradle.kts (nivel proyecto)
plugins {
    kotlin("multiplatform") version "1.9.22" apply false
    kotlin("android") version "1.9.22" apply false
    id("com.android.application") version "8.2.2" apply false
    id("com.android.library") version "8.2.2" apply false
}
```

### 4.2 Editar `androidApp/build.gradle.kts`:

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
}

android {
    namespace = "mx.cetis24.scesa.mobile"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "mx.cetis24.scesa.mobile"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }
    
    buildFeatures {
        compose = true
        viewBinding = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // Jetpack Compose
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.8.2")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.7")
    
    // CameraX para escaneo QR
    implementation("androidx.camera:camera-camera2:1.3.1")
    implementation("androidx.camera:camera-lifecycle:1.3.1")
    implementation("androidx.camera:camera-view:1.3.1")
    
    // ML Kit Barcode Scanning (para QR)
    implementation("com.google.mlkit:barcode-scanning:17.2.0")
    
    // Coil para cargar imágenes
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Retrofit para API (futuro uso con Supabase)
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    
    // ViewModel y Lifecycle
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")
    
    // Debug
    debugImplementation("androidx.compose.ui:ui-tooling")
}
```

---

## 🔒 Paso 5: Configurar Permisos

### 5.1 Editar `AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permisos -->
    <uses-feature android:name="android.hardware.camera" />
    <uses-feature android:name="android.hardware.camera.autofocus" />
    
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SCESAMobile">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.SCESAMobile">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

---

## 💻 Paso 6: Código de la Aplicación

### 6.1 Crear MainActivity.kt:

Crea el archivo: `androidApp/src/main/java/mx/cetis24/scesa/mobile/MainActivity.kt`

```kotlin
package mx.cetis24.scesa.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import mx.cetis24.scesa.mobile.ui.theme.SCESATheme
import mx.cetis24.scesa.mobile.ui.navigation.SCESANavigation

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SCESATheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SCESANavigation()
                }
            }
        }
    }
}
```

### 6.2 Crear Sistema de Navegación:

Crea: `androidApp/src/main/java/mx/cetis24/scesa/mobile/ui/navigation/SCESANavigation.kt`

```kotlin
package mx.cetis24.scesa.mobile.ui.navigation

import androidx.compose.runtime.*
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import mx.cetis24.scesa.mobile.ui.screens.*

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object MainMenu : Screen("main_menu")
    object QRScanner : Screen("qr_scanner")
    object ManualRegister : Screen("manual_register")
}

@Composable
fun SCESANavigation() {
    val navController = rememberNavController()
    var isAuthenticated by remember { mutableStateOf(false) }
    
    NavHost(
        navController = navController,
        startDestination = if (isAuthenticated) Screen.MainMenu.route else Screen.Login.route
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    isAuthenticated = true
                    navController.navigate(Screen.MainMenu.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.MainMenu.route) {
            MainMenuScreen(
                onNavigateToQRScan = {
                    navController.navigate(Screen.QRScanner.route)
                },
                onNavigateToManualRegister = {
                    navController.navigate(Screen.ManualRegister.route)
                },
                onLogout = {
                    isAuthenticated = false
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.QRScanner.route) {
            QRScannerScreen(
                onBack = { navController.popBackStack() }
            )
        }
        
        composable(Screen.ManualRegister.route) {
            ManualRegisterScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
```

### 6.3 Crear Tema de la App:

Crea: `androidApp/src/main/java/mx/cetis24/scesa/mobile/ui/theme/Theme.kt`

```kotlin
package mx.cetis24.scesa.mobile.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Colores institucionales CETIS 24
private val PrimaryBlue = Color(0xFF1A3A5C)
private val SecondaryBlue = Color(0xFF2E6DA4)
private val BackgroundLight = Color(0xFFF5F7FA)
private val SuccessGreen = Color(0xFF10B981)
private val ErrorRed = Color(0xFFEF4444)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryBlue,
    secondary = SecondaryBlue,
    background = BackgroundLight,
    surface = Color.White,
    error = ErrorRed,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color(0xFF1E1E1E),
    onSurface = Color(0xFF1E1E1E)
)

@Composable
fun SCESATheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography(),
        content = content
    )
}
```

### 6.4 Crear Pantalla de Login:

Crea: `androidApp/src/main/java/mx/cetis24/scesa/mobile/ui/screens/LoginScreen.kt`

```kotlin
package mx.cetis24.scesa.mobile.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import mx.cetis24.scesa.mobile.R

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit
) {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Logo
            Image(
                painter = painterResource(id = R.drawable.logo_cetis24),
                contentDescription = "Logo CETIS 24",
                modifier = Modifier
                    .size(120.dp)
                    .padding(bottom = 16.dp)
            )
            
            // Título
            Text(
                text = "SCESA Mobile",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            
            Text(
                text = "Sistema de Control de Entradas y Salidas",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                modifier = Modifier.padding(bottom = 32.dp)
            )
            
            // Campo de usuario
            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Usuario") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                singleLine = true
            )
            
            // Campo de contraseña
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Contraseña") },
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                singleLine = true
            )
            
            // Botón de login
            Button(
                onClick = {
                    isLoading = true
                    // Simulación de login - reemplazar con API real
                    if (username == "admin" && password == "admin123") {
                        onLoginSuccess()
                    }
                    isLoading = false
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                enabled = username.isNotEmpty() && password.isNotEmpty() && !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.onPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                } else {
                    Text("Ingresar", fontSize = 16.sp)
                }
            }
        }
    }
}
```

### 6.5 Crear Pantalla de Menú Principal:

Crea: `androidApp/src/main/java/mx/cetis24/scesa/mobile/ui/screens/MainMenuScreen.kt`

```kotlin
package mx.cetis24.scesa.mobile.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import mx.cetis24.scesa.mobile.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainMenuScreen(
    onNavigateToQRScan: () -> Unit,
    onNavigateToManualRegister: () -> Unit,
    onLogout: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Menú Principal") },
                actions = {
                    IconButton(onClick = onLogout) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Cerrar sesión")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    actionIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Logo
            Image(
                painter = painterResource(id = R.drawable.logo_cetis24),
                contentDescription = "Logo CETIS 24",
                modifier = Modifier
                    .size(100.dp)
                    .padding(bottom = 32.dp)
            )
            
            // Botón Escaneo QR
            Card(
                onClick = onNavigateToQRScan,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            ) {
                Column(
                    modifier = Modifier
                        .padding(24.dp)
                        .fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Escaneo QR",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Registrar entrada/salida con código QR",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f)
                    )
                }
            }
            
            // Botón Registro Manual
            Card(
                onClick = onNavigateToManualRegister,
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.secondary
                )
            ) {
                Column(
                    modifier = Modifier
                        .padding(24.dp)
                        .fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Registro Manual",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Buscar alumno por nombre y grupo",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f)
                    )
                }
            }
        }
    }
}
```

### 6.6 Crear Pantalla de Escaneo QR:

Crea: `androidApp/src/main/java/mx/cetis24/scesa/mobile/ui/screens/QRScannerScreen.kt`

```kotlin
package mx.cetis24.scesa.mobile.ui.screens

import android.Manifest
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberPermissionState
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.Executors

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
fun QRScannerScreen(
    onBack: () -> Unit
) {
    val cameraPermission = rememberPermissionState(Manifest.permission.CAMERA)
    var scannedCode by remember { mutableStateOf<String?>(null) }
    
    LaunchedEffect(Unit) {
        cameraPermission.launchPermissionRequest()
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Escaneo QR") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (cameraPermission.hasPermission) {
                CameraPreview(
                    onQRCodeScanned = { code ->
                        scannedCode = code
                    }
                )
                
                // Overlay con instrucciones
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.BottomCenter)
                        .padding(24.dp)
                ) {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f)
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            if (scannedCode != null) {
                                Text("Código escaneado: $scannedCode")
                                Spacer(modifier = Modifier.height(8.dp))
                                Button(onClick = { scannedCode = null }) {
                                    Text("Escanear otro")
                                }
                            } else {
                                Text("Enfoca el código QR de la credencial")
                            }
                        }
                    }
                }
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("Se requiere permiso de cámara")
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = { cameraPermission.launchPermissionRequest() }) {
                        Text("Conceder permiso")
                    }
                }
            }
        }
    }
}

@Composable
private fun CameraPreview(
    onQRCodeScanned: (String) -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }
    
    AndroidView(
        factory = { ctx ->
            val previewView = PreviewView(ctx)
            val executor = ContextCompat.getMainExecutor(ctx)
            
            cameraProviderFuture.addListener({
                val cameraProvider = cameraProviderFuture.get()
                val preview = Preview.Builder().build().also {
                    it.setSurfaceProvider(previewView.surfaceProvider)
                }
                
                val imageAnalysis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                
                val barcodeScanner = BarcodeScanning.getClient()
                
                imageAnalysis.setAnalyzer(Executors.newSingleThreadExecutor()) { imageProxy ->
                    val mediaImage = imageProxy.image
                    if (mediaImage != null) {
                        val image = InputImage.fromMediaImage(
                            mediaImage,
                            imageProxy.imageInfo.rotationDegrees
                        )
                        
                        barcodeScanner.process(image)
                            .addOnSuccessListener { barcodes ->
                                for (barcode in barcodes) {
                                    barcode.rawValue?.let { value ->
                                        onQRCodeScanned(value)
                                    }
                                }
                            }
                            .addOnCompleteListener {
                                imageProxy.close()
                            }
                    } else {
                        imageProxy.close()
                    }
                }
                
                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
                
                try {
                    cameraProvider.unbindAll()
                    cameraProvider.bindToLifecycle(
                        lifecycleOwner,
                        cameraSelector,
                        preview,
                        imageAnalysis
                    )
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }, executor)
            
            previewView
        },
        modifier = Modifier.fillMaxSize()
    )
}
```

### 6.7 Crear Pantalla de Registro Manual:

Crea: `androidApp/src/main/java/mx/cetis24/scesa/mobile/ui/screens/ManualRegisterScreen.kt`

```kotlin
package mx.cetis24.scesa.mobile.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ManualRegisterScreen(
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedGroup by remember { mutableStateOf("") }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Registro Manual") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp)
        ) {
            // Buscador
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                label = { Text("Nombre del alumno") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                singleLine = true
            )
            
            // Selector de grupo
            OutlinedTextField(
                value = selectedGroup,
                onValueChange = { selectedGroup = it },
                label = { Text("Grupo (ej: 6AM)") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                singleLine = true
            )
            
            // Botones de acción
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Button(
                    onClick = { /* Registrar entrada */ },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.secondary
                    )
                ) {
                    Text("Entrada")
                }
                
                Button(
                    onClick = { /* Registrar salida */ },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Salida")
                }
            }
            
            // Resultados de búsqueda
            if (searchQuery.isNotEmpty()) {
                Spacer(modifier = Modifier.height(24.dp))
                Text("Resultados:", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(8.dp))
                // Aquí irían los resultados de búsqueda
                Text("Buscando: $searchQuery en grupo: $selectedGroup")
            }
        }
    }
}
```

---

## ▶️ Paso 7: Ejecutar la Aplicación

### 7.1 Sincronizar el Proyecto:

1. En Android Studio, haz clic en: **File → Sync Project with Gradle Files**
2. Espera a que todas las dependencias se descarguen

### 7.2 Configurar Emulador o Dispositivo:

**Opción A: Emulador**
1. Ve a: **Tools → Device Manager**
2. Crea un nuevo dispositivo virtual (AVD)
3. Selecciona: Pixel 7 con Android 14 (API 34)
4. Haz clic en el botón de play para iniciarlo

**Opción B: Dispositivo Físico**
1. Habilita "Opciones de desarrollador" en tu Android
2. Activa "Depuración USB"
3. Conecta el dispositivo por USB
4. Acepta el permiso de depuración

### 7.3 Ejecutar la App:

1. Asegúrate de que el módulo **androidApp** esté seleccionado
2. Haz clic en el botón **Run** (triángulo verde) o presiona **Shift + F10**
3. Selecciona tu dispositivo/emulador
4. Espera a que la app se compile e instale

### 7.4 Probar la Aplicación:

**Credenciales de prueba:**
- Usuario: `admin`
- Contraseña: `admin123`

**Funcionalidades a probar:**
1. Login
2. Navegación al menú principal
3. Escaneo QR (requiere permitir acceso a cámara)
4. Registro manual con búsqueda
5. Cerrar sesión

---

## 🔧 Solución de Problemas Comunes

### Error: "SDK location not found"
**Solución:**
1. Crea un archivo `local.properties` en la raíz del proyecto
2. Agrega: `sdk.dir=/ruta/a/tu/Android/sdk`

### Error de compilación con Kotlin
**Solución:**
- Verifica que todas las versiones de Kotlin sean iguales
- Ejecuta: **Build → Clean Project** y luego **Build → Rebuild Project**

### Cámara no funciona en emulador
**Solución:**
- Usa un dispositivo físico para probar escaneo QR
- O configura la cámara virtual del AVD en configuración avanzada

### Gradle sync falla
**Solución:**
1. Invalida caché: **File → Invalidate Caches → Invalidate and Restart**
2. Borra carpetas `.gradle` y `build` del proyecto
3. Vuelve a sincronizar

---

## 📱 Próximos Pasos

### Funcionalidades Pendientes:

1. **Integración con API/Supabase:**
   - Conectar login real
   - Guardar registros de asistencia
   - Sincronizar con dashboard web

2. **Mejoras de UI:**
   - Animaciones de transición
   - Feedback visual mejorado
   - Modo oscuro

3. **Validaciones:**
   - Verificar duplicados de registro
   - Alertas de horarios
   - Notificaciones push

4. **Almacenamiento Local:**
   - Room Database para modo offline
   - Sincronización automática

### Recursos Adicionales:

- **Documentación de Kotlin:** https://kotlinlang.org/docs/home.html
- **Jetpack Compose:** https://developer.android.com/jetpack/compose
- **CameraX:** https://developer.android.com/training/camerax
- **ML Kit:** https://developers.google.com/ml-kit/vision/barcode-scanning/android

---

## ✅ Checklist de Implementación

- [ ] Android Studio instalado
- [ ] Plugin KMM instalado
- [ ] Proyecto creado
- [ ] Logo agregado a `res/drawable`
- [ ] Colores configurados en `colors.xml`
- [ ] Dependencias agregadas
- [ ] Permisos configurados en `AndroidManifest.xml`
- [ ] MainActivity creada
- [ ] Sistema de navegación implementado
- [ ] Pantalla de Login implementada
- [ ] Pantalla de Menú Principal implementada
- [ ] Pantalla de Escaneo QR implementada
- [ ] Pantalla de Registro Manual implementada
- [ ] App compilada exitosamente
- [ ] App probada en dispositivo/emulador

---

## 📞 Notas Finales

Esta guía proporciona la base completa para la aplicación móvil SCESA. El código está estructurado siguiendo las mejores prácticas de Android y Jetpack Compose, con arquitectura modular y diseño institucional del CETIS 24.

**IMPORTANTE:** Recuerda actualizar las credenciales de prueba y reemplazar las simulaciones con llamadas reales a tu API cuando esté lista.

