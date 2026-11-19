import Capacitor
import StoreKit

@available(iOS 15.0, *)
@objc(RDMCRegistrationPlugin)
final class RDMCRegistrationPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "RDMCRegistrationPlugin"
    let jsName = "RDMCRegistration"
    let pluginMethods: [CAPPluginMethod] = ["status", "pricing", "purchase", "restore"].compactMap {
        CAPPluginMethod(name: $0, returnType: CAPPluginReturnPromise)
    }
    private let productID = "us.rdmcfairfieldcounty.live.registration"
    private var listener: Task<Void, Never>?

    override func load() {
        listener = Task { [weak self] in
            for await result in Transaction.updates {
                guard let self, case .verified(let transaction) = result,
                      transaction.productID == self.productID else { continue }
                // Ownership is recorded by StoreKit and checked again before signup.
                await transaction.finish()
                self.notifyListeners("registrationChanged", data: [:])
            }
        }
    }

    deinit { listener?.cancel() }

    private func ownsRegistration() async -> Bool {
        guard let result = await Transaction.latest(for: productID),
              case .verified(let transaction) = result else { return false }
        return transaction.productID == productID &&
            transaction.productType == .nonConsumable && transaction.revocationDate == nil
    }

    private func product() async throws -> Product {
        guard let item = try await Product.products(for: [productID]).first,
              item.type == .nonConsumable else {
            throw NSError(domain: "RDMCRegistration", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "Registration pricing is unavailable in the App Store. Try again later."
            ])
        }
        return item
    }

    @objc func pricing(_ call: CAPPluginCall) {
        Task {
            do {
                let item = try await product()
                call.resolve(["price": item.displayPrice])
            } catch { call.reject(error.localizedDescription) }
        }
    }

    @objc func status(_ call: CAPPluginCall) {
        Task {
            call.resolve(["owned": await ownsRegistration()])
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        Task { @MainActor in
            do {
                let item = try await product()
                switch try await item.purchase() {
                case .success(.verified(let transaction)):
                    guard transaction.productID == productID, transaction.revocationDate == nil else {
                        call.reject("Registration could not be verified."); return
                    }
                    await transaction.finish()
                    call.resolve(["owned": true])
                case .success(.unverified(_, _)): call.reject("Apple could not verify this purchase.")
                case .pending: call.resolve(["pending": true])
                case .userCancelled: call.resolve(["cancelled": true])
                @unknown default: call.reject("Please check your registration purchase again.")
                }
            } catch { call.reject(error.localizedDescription) }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                call.resolve(["owned": await ownsRegistration()])
            } catch { call.reject(error.localizedDescription) }
        }
    }
}

@objc(RDMCBridgeViewController)
final class RDMCBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        if #available(iOS 15.0, *) {
            bridge?.registerPluginInstance(RDMCRegistrationPlugin())
        }
    }
}
