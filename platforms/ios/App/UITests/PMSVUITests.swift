import XCTest

final class PMSVUITests: XCTestCase {
    func testBundledInterfaceAndLicenceTool() {
        let app = XCUIApplication()
        app.launchArguments = ["-pmsv-ui-testing"]
        app.launch()
        XCTAssertTrue(app.webViews.staticTexts["Welcome to the Forum"].firstMatch.waitForExistence(timeout: 30))
        let home = XCTAttachment(screenshot: app.screenshot()); home.name = "PMSV-iPhone-Home"; home.lifetime = .keepAlways; add(home)
        let licence = app.webViews.links.matching(NSPredicate(format: "label CONTAINS 'FSSAI Licence'")).firstMatch
        XCTAssertTrue(licence.waitForExistence(timeout: 10)); licence.tap()
        XCTAssertTrue(app.webViews.staticTexts["Find the right FSSAI licence"].firstMatch.waitForExistence(timeout: 15))
        let tool = XCTAttachment(screenshot: app.screenshot()); tool.name = "PMSV-iPhone-Licence"; tool.lifetime = .keepAlways; add(tool)
        let start = app.webViews.buttons["Start licence finder"].firstMatch
        XCTAssertTrue(start.exists); start.tap()
        XCTAssertTrue(app.webViews.staticTexts.matching(NSPredicate(format: "label CONTAINS[c] 'business'")).firstMatch.waitForExistence(timeout: 10))
    }
}
