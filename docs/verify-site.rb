# Run after a real Jekyll build: bundle exec ruby docs/verify-site.rb [output-dir]
require 'nokogiri'
require 'uri'

root = File.expand_path(ARGV.fetch(0, '_site'))
html = File.read(File.join(root, 'index.html'))
page = Nokogiri::HTML(html)
expected = %w[about-me news publications honors-and-awards projects society]
actual = page.css('main > section').map { |node| node['id'] }
abort "Incorrect homepage section nesting: #{actual.inspect}" unless actual == expected
abort 'HTML closing tags escaped by Markdown' if html.match?(/&lt;\/(?:div|section)&gt;/)

paths = page.css('img[src], script[src], link[rel="stylesheet"]').map { |node| node['src'] || node['href'] }
paths += %w[/assets/models/tsinghua-gate.glb /assets/models/mobius-metal.glb]
paths.each do |path|
  next unless path.start_with?('/') && !path.start_with?('//')
  file = File.join(root, URI::DEFAULT_PARSER.unescape(path.split(/[?#]/).first))
  abort "Missing homepage asset: #{path}" unless File.file?(file)
end
Dir.glob(File.join(root, 'assets/js/**/*.js')).each do |file|
  File.read(file).scan(/\bfrom\s*['"](\.[^'"]+)['"]/).flatten.each do |path|
    dependency = File.expand_path(path, File.dirname(file))
    abort "Missing module #{path} imported by #{file}" unless File.file?(dependency)
  end
end
puts 'PASS: homepage section nesting, images, styles, models, and local module imports.'
