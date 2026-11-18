require 'xcodeproj'
require 'fileutils'
root = 'ios/App'
FileUtils.mkdir_p("#{root}/RegistrationUITests")
files = %w[RegistrationUITests.swift Registration.storekit]
files.each { |name| FileUtils.cp("ios-review/#{name}", "#{root}/RegistrationUITests/#{name}") }
project = Xcodeproj::Project.open("#{root}/App.xcodeproj")
app = project.targets.find { |t| t.product_type == 'com.apple.product-type.application' }
test = project.new_target(:ui_test_bundle, 'RegistrationUITests', :ios, '15.0')
test.add_dependency(app)
group = project.main_group.new_group('RegistrationUITests', 'RegistrationUITests')
test.source_build_phase.add_file_reference(group.new_file(files.first))
test.resources_build_phase.add_file_reference(group.new_file(files.last))
test.build_configurations.each do |config|
  config.build_settings.merge!('PRODUCT_NAME'=>'RegistrationUITests','GENERATE_INFOPLIST_FILE'=>'YES','PRODUCT_BUNDLE_IDENTIFIER'=>'us.rdmcfairfieldcounty.live.registration-tests','TEST_TARGET_NAME'=>app.name,'SWIFT_VERSION'=>'5.0','TARGETED_DEVICE_FAMILY'=>'1,2')
end
project.save
scheme = Xcodeproj::XCScheme.new
scheme.configure_with_targets(app, test)
scheme.save_as(project.path, 'RegistrationReview', true)
