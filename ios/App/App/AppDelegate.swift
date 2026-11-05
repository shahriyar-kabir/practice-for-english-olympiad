import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

// The bundled app uses Keychain for its session and UIKit for file exports.
// This stays in the app target; no third-party storage SDK is required.
import Security

#if DEBUG
private func writeStartupMarker(state: String, phase: String = "", code: String = "") throws {
    let directory = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("Wizpiko", isDirectory: true)
    try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    let data = try JSONSerialization.data(withJSONObject: ["state": state, "phase": phase, "code": code])
    try data.write(to: directory.appendingPathComponent("startup.json"), options: .atomic)
}
#endif

final class WizpikoViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(WizpikoDevicePlugin())
        #if DEBUG
        try? writeStartupMarker(state: "opening", phase: "native-bridge")
        #endif
    }
}

@objc(WizpikoDevicePlugin)
public final class WizpikoDevicePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WizpikoDevicePlugin"
    public let jsName = "WizpikoDevice"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getSession", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setSession", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearSession", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveDocument", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "recordStartup", returnType: CAPPluginReturnPromise)
    ]
    private var query: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: (Bundle.main.bundleIdentifier ?? "com.wizpiko.app") + ".session",
         kSecAttrAccount as String: "learner-session",
         kSecAttrSynchronizable as String: false]
    }

    @objc func getSession(_ call: CAPPluginCall) {
        var request = query
        request[kSecReturnData as String] = true
        request[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        let status = SecItemCopyMatching(request as CFDictionary, &result)
        if status == errSecItemNotFound { call.resolve(["value": ""]); return }
        guard status == errSecSuccess, let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            NSLog("Wizpiko secure session read failed (%d)", status)
            call.reject("Secure sign-in storage is unavailable.", "KEYCHAIN_READ_FAILED"); return
        }
        call.resolve(["value": value])
    }

    @objc func setSession(_ call: CAPPluginCall) {
        guard let value = call.getString("value"), value.utf8.count <= 32768,
              let data = value.data(using: .utf8),
              let object = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any],
              let access = object["access_token"] as? String, !access.isEmpty,
              let refresh = object["refresh_token"] as? String, !refresh.isEmpty,
              object["expires_at"] is NSNumber else {
            call.reject("The sign-in session is invalid.", "INVALID_SESSION"); return
        }
        let attributes: [String: Any] = [kSecValueData as String: data,
                                       kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly]
        var status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        if status == errSecItemNotFound {
            status = SecItemAdd(query.merging(attributes) { _, value in value } as CFDictionary, nil)
        }
        guard status == errSecSuccess else {
            call.reject("Your secure sign-in could not be saved.", "KEYCHAIN_WRITE_FAILED"); return
        }
        call.resolve()
    }

    @objc func clearSession(_ call: CAPPluginCall) {
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            call.reject("Your saved sign-in could not be removed.", "KEYCHAIN_DELETE_FAILED"); return
        }
        call.resolve()
    }

    // A debug-only, account-free readiness marker lets the Mac build verify the
    // real WebKit/Keychain startup instead of accepting a screenshot of an error.
    @objc func recordStartup(_ call: CAPPluginCall) {
        #if DEBUG
        let state = call.getString("state") ?? ""
        guard ["ready", "failed"].contains(state) else { call.reject("Invalid startup state"); return }
        let phase = String((call.getString("phase") ?? "").prefix(64))
        let code = String((call.getString("code") ?? "").prefix(64))
        do {
            try writeStartupMarker(state: state, phase: phase, code: code)
        } catch { call.reject("Startup check unavailable"); return }
        #endif
        call.resolve()
    }

    @objc func saveDocument(_ call: CAPPluginCall) {
        guard let filename = call.getString("filename"), filename.count <= 160,
              filename.range(of: "^[A-Za-z0-9][A-Za-z0-9._-]*\\.(pdf|png)$", options: .regularExpression) != nil,
              let encoded = call.getString("data"), encoded.count <= 16000000,
              let data = Data(base64Encoded: encoded), !data.isEmpty else {
            call.reject("The certificate file is invalid.", "INVALID_DOCUMENT"); return
        }
        let signature = filename.hasSuffix(".pdf") ? Data("%PDF-".utf8) : Data([137,80,78,71,13,10,26,10])
        guard data.starts(with: signature) else {
            call.reject("The certificate format is invalid.", "INVALID_DOCUMENT"); return
        }
        do {
            let directory = FileManager.default.temporaryDirectory.appendingPathComponent("WizpikoCertificates", isDirectory: true)
            if FileManager.default.fileExists(atPath: directory.path) { try FileManager.default.removeItem(at: directory) }
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            let file = directory.appendingPathComponent(filename)
            try data.write(to: file, options: [.atomic, .completeFileProtection])
            DispatchQueue.main.async { [weak self] in
                guard let controller = self?.bridge?.viewController else {
                    call.reject("The sharing window is unavailable.", "SHARE_UNAVAILABLE"); return
                }
                let activity = UIActivityViewController(activityItems: [file], applicationActivities: nil)
                activity.popoverPresentationController?.sourceView = controller.view
                activity.popoverPresentationController?.sourceRect = CGRect(x: controller.view.bounds.midX, y: controller.view.bounds.midY, width: 1, height: 1)
                activity.popoverPresentationController?.permittedArrowDirections = []
                activity.completionWithItemsHandler = { _, _, _, error in
                    if let error = error { call.reject("The certificate could not be shared.", "SHARE_FAILED", error) }
                    else { call.resolve() }
                }
                controller.present(activity, animated: true)
            }
        } catch { call.reject("The certificate could not be saved.", "FILE_WRITE_FAILED", error) }
    }
}
