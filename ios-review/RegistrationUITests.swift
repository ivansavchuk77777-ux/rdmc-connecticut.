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
        let buy = button("Register for $1.99")
        XCTAssertTrue(buy.waitForExistence(timeout: 35))
        XCTAssertTrue(button("Restore Purchase").exists)
        let shot = XCTAttachment(screenshot: app.screenshot())
        shot.name = "RDMC-Registration-Review"
        shot.lifetime = .keepAlways
        add(shot)
        buy.tap()
        XCTAssertTrue(button("Complete registration").waitForExistence(timeout: 30))
        XCTAssertEqual(session.allTransactions().count, 1)
    }
}
