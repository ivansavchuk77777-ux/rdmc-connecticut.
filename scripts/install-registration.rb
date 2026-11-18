require 'xcodeproj'
require 'fileutils'
require 'rexml/document'

root = 'ios/App'
FileUtils.cp('native/Registration.swift', "#{root}/App/Registration.swift")
project = Xcodeproj::Project.open("#{root}/App.xcodeproj")
target = project.targets.find { |item| item.product_type == 'com.apple.product-type.application' }
group = project.main_group.find_subpath('App', false)
source = group.files.find { |ref| ref.path == 'Registration.swift' } || group.new_file('Registration.swift')
target.add_file_references([source]) unless target.source_build_phase.files_references.include?(source)
project.save

path = "#{root}/App/Base.lproj/Main.storyboard"
document = REXML::Document.new(File.read(path))
controller = REXML::XPath.first(document, "//viewController[@customClass='CAPBridgeViewController' or @customClass='RDMCBridgeViewController']")
raise 'Cannot locate Capacitor bridge controller' unless controller
controller.attributes['customClass'] = 'RDMCBridgeViewController'
controller.attributes.delete('customModule')
controller.attributes.delete('customModuleProvider')
File.open(path, 'w') { |file| document.write(file) }
