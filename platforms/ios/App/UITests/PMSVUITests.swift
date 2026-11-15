import XCTest

final class PMSVUITests: XCTestCase {
    override func setUpWithError() throws { continueAfterFailure = false }

    private func openInspections(_ app: XCUIApplication) {
        let audits = app.webViews.links.matching(NSPredicate(format: "label == 'Audits'")).firstMatch
        XCTAssertTrue(audits.waitForExistence(timeout: 20)); audits.tap()
        let inspection = app.webViews.links.matching(NSPredicate(format: "label CONTAINS 'FSSAI Schedule IV Inspection'")).firstMatch
        XCTAssertTrue(inspection.waitForExistence(timeout: 15)); inspection.tap()
    }

    func testOfflineAuditSurvivesRestart() {
        let recordName = "PMSV test \(UUID().uuidString.prefix(8))"
        let app = XCUIApplication(); app.launchArguments = ["-pmsv-ui-testing"]; app.launch()
        openInspections(app)
        let newAudit = app.webViews.buttons.matching(NSPredicate(format: "label CONTAINS 'Start New Audit'")).firstMatch
        XCTAssertTrue(newAudit.waitForExistence(timeout: 15)); newAudit.tap()
        let manufacturing = app.webViews.buttons.matching(NSPredicate(format: "label CONTAINS 'General Manufacturing'")).firstMatch
        XCTAssertTrue(manufacturing.waitForExistence(timeout: 10)); manufacturing.tap()
        app.webViews.buttons.matching(NSPredicate(format: "label CONTAINS 'Start Assessment'")).firstMatch.tap()
        let fbo = app.webViews.textFields["FBO Name"].firstMatch
        XCTAssertTrue(fbo.waitForExistence(timeout: 15)); fbo.tap(); fbo.typeText(recordName)
        XCTAssertEqual(fbo.value as? String, recordName)
        app.webViews.staticTexts["General Manufacturing"].firstMatch.tap()
        app.webViews.buttons["Save"].firstMatch.tap()
        // The saved tick lasts only 1.3 seconds and is easy for a busy simulator to miss.
        // A unique record reopened after termination is the durable save assertion.
        app.terminate(); app.launch(); openInspections(app)
        let saved = app.webViews.buttons.matching(NSPredicate(format: "label CONTAINS 'Saved Audits'")).firstMatch
        XCTAssertTrue(saved.waitForExistence(timeout: 10)); saved.tap()
        let record = app.webViews.buttons.matching(NSPredicate(format: "label CONTAINS %@", recordName)).firstMatch
        XCTAssertTrue(record.waitForExistence(timeout: 10)); record.tap()
        XCTAssertTrue(fbo.waitForExistence(timeout: 10)); XCTAssertEqual(fbo.value as? String, recordName)
        let savedScreen = XCTAttachment(screenshot: app.screenshot()); savedScreen.name = "PMSV-iPhone-Saved-Audit"; savedScreen.lifetime = .keepAlways; add(savedScreen)
    }

    func testBundledInterfaceAndLicenceTool() {
        let app = XCUIApplication()
        app.launchArguments = ["-pmsv-ui-testing"]
        app.launch()
        XCTAssertTrue(app.webViews.staticTexts["Welcome to the Forum"].firstMatch.waitForExistence(timeout: 90))
        XCTAssertTrue(app.webViews.links["PMSV logo ready"].firstMatch.waitForExistence(timeout: 15))
        let home = XCTAttachment(screenshot: app.screenshot()); home.name = "PMSV-iPhone-Home"; home.lifetime = .keepAlways; add(home)
        let licence = app.webViews.links.matching(NSPredicate(format: "label CONTAINS 'FSSAI Licence'")).firstMatch
        XCTAssertTrue(licence.waitForExistence(timeout: 10)); licence.tap()
        XCTAssertTrue(app.webViews.staticTexts["Find the right FSSAI licence"].firstMatch.waitForExistence(timeout: 15))
        XCTAssertTrue(app.webViews.links["PMSV logo ready"].firstMatch.waitForExistence(timeout: 15))
        let tool = XCTAttachment(screenshot: app.screenshot()); tool.name = "PMSV-iPhone-Licence"; tool.lifetime = .keepAlways; add(tool)
        let start = app.webViews.buttons["Start licence finder"].firstMatch
        XCTAssertTrue(start.exists); start.tap()
        XCTAssertTrue(app.webViews.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] 'business'")).firstMatch.waitForExistence(timeout: 10))
    }
}
