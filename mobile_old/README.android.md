# Android Development Setup

## Windows Path Length Workaround

Due to Windows path length limitations with Bun's `.bun` folder structure in our monorepo, building the Android app requires special setup.

### Prerequisites

1. **Enable Windows Long Paths** (one-time setup):
   - Open PowerShell as Administrator
   - Run: `New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force`
   - Restart your computer

   OR use Group Policy Editor:
   - Open `gpedit.msc`
   - Go to: Local Computer Policy > Computer Configuration > Administrative Templates > System > Filesystem
   - Enable: "Enable Win32 long paths"

2. **Install Ninja v1.12+** (one-time setup):
   - Download from: <https://github.com/ninja-build/ninja/releases> (get v1.12.0 or later)
   - Place `ninja.exe` in `tools/ninja.exe` at the monorepo root (`D:\DEVELOPMENT\projects\safely\tools\ninja.exe`)

3. **Connect your Android device via USB**:
   - Enable Developer Options on your phone (tap Build Number 7 times)
   - Enable USB Debugging in Developer Options
   - Connect via USB and allow debugging when prompted

4. **WIFI ADB**

From a computer, if you have USB access already (no root required)

It is even easier to switch to using Wi-Fi, if you already have USB. From a command line on the computer that has the device connected via USB, issue the commands

```sh
adb tcpip 5555
adb connect 192.168.0.101:5555
```

Be sure to replace 192.168.0.101 with the IP address that is actually assigned to your device. Once you are done, you can disconnect from the adb tcp session by running:

```sh
adb disconnect 192.168.0.101:5555
```

You can find the IP address of a tablet in two ways:

Manual IP Discovery:

Go into Android's WiFi settings, click the menu button in the action bar (the vertical ellipsis), hit Advanced and see the IP address at the bottom of the screen.

Use ADB to discover IP:

Execute the following command via adb:

```sh
adb shell ip -f inet addr show wlan0
```

To tell the ADB daemon return to listening over USB

```sh
adb usb
```

### Building the App

#### Option 1: Using the Build Script (Recommended)

```powershell
cd apps/mobile
.\build-android.ps1
```

This script:

- Maps your project to a shorter drive path (S:) to avoid path length issues
- Runs the build
- Optionally removes the drive mapping when done

#### Option 2: Manual Build

If you prefer not to use drive mapping:

```powershell
cd apps/mobile
npx expo run:android
```

Note: The manual build may still hit path length issues depending on your Windows configuration.

### Development Workflow

After the initial build:

1. The custom dev client is installed on your device
2. For JS/TS changes: Just run `npx expo start` and save files for hot reload
3. Only rebuild when:
   - Adding/removing native modules
   - Changing app.json plugins
   - Modifying native code

### Troubleshooting

#### "ninja: error: manifest 'build.ninja' still dirty"

- Your path is still too long
- Use the `build-android.ps1` script with drive mapping
- Ensure ninja.exe is in the correct location

#### "Cannot find ninja.exe"

- Check that `tools/ninja.exe` exists at the monorepo root
- Verify the file is executable (not blocked by Windows)

#### Build succeeds but app won't connect to Metro

- Ensure your device and computer are on the same Wi-Fi network
- Run `npx expo start` and scan the QR code from the dev client

### Technical Details

The build configuration includes:

- Custom ninja v1.12+ with long path support (via `CMAKE_MAKE_PROGRAM`)
- Increased CMake object path max to 1024 (via `CMAKE_OBJECT_PATH_MAX`)
- These settings are applied globally to all native modules

See `android/app/build.gradle` and `android/build.gradle` for implementation details.
