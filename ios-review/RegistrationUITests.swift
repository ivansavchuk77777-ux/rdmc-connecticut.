import XCTest
import StoreKitTest

final class RegistrationUITests: XCTestCase {
    func testRegistrationPurchase() throws {
        let session = try SKTestSession(configurationFileNamed: "Registration")
        session.disableDialogs = true
        session.locale = Locale(identifier: "en_US")
        session.storefront = "USA"
        session.clearTransactions()
        let app = XCUIApplication()
        app.launch()
        let web = app.webViews.firstMatch
        func button(_ label: String) -> XCUIElement { web.buttons[label].firstMatch }
        let login = button("Member Login")
        XCTAssertTrue(login.waitForExistence(timeout: 30))
        login.tap()
        for (field, value) in [("Name / road name","Demo Rider"), ("Clubhouse / chapter","Sample Chapter"), ("Country","United States"), ("Email","review@example.com")] {
            let input = web.textFields[field].firstMatch
            XCTAssertTrue(input.waitForExistence(timeout: 10), field)
            input.tap()
            input.typeText(value)
        }
        let password = web.secureTextFields.firstMatch
        password.tap()
        password.typeText("SampleOnly123")
        if app.buttons["Done"].exists { app.buttons["Done"].tap() }
        let create = button("Create Account (Owner Approval Required)")
        create.tap()
        let buy = web.buttons.matching(NSPredicate(format: "label BEGINSWITH %@ AND label CONTAINS %@", "Register for ", "1.99")).firstMatch
        guard buy.waitForExistence(timeout: 35) else {
            // Only report purchase-screen labels for this signed-out synthetic fixture.
            let labels = web.buttons.allElementsBoundByIndex.map(\.label)
            let messages = web.staticTexts.allElementsBoundByIndex.map(\.label)
            XCTFail("Registration screen: buttons=\(labels), messages=\(messages)")
            return
        }
        XCTAssertTrue(button("Restore Purchase").exists)
        let shot = XCTAttachment(screenshot: app.screenshot())
        shot.name = "RDMC-Registration-Review"
        shot.lifetime = .keepAlways
        add(shot)
        buy.tap()
        XCTAssertTrue(button("Complete registration").waitForExistence(timeout: 30))
        let restore = button("Restore Purchase")
        restore.tap()
        XCTAssertTrue(web.staticTexts["Registration purchase restored."].firstMatch.waitForExistence(timeout: 30))
        let complete = button("Complete registration")
        let ready = NSPredicate(format: "exists == true AND enabled == true")
        let restored = XCTNSPredicateExpectation(predicate: ready, object: complete)
        XCTAssertEqual(XCTWaiter.wait(for: [restored], timeout: 30), .completed)
        XCTAssertEqual(session.allTransactions().count, 1)
    }
}
