var Jasmine = require('jasmine'),
	JasmineReporters = require('jasmine-reporters');

var jasmine = new Jasmine();

function getConfig() {
	return {
		spec_dir: 'specs',
		spec_files: [
        'unit-tests/**/*-unitspec.js'
    ]
	}
}

function getReport(reportType) {
	var reporters = {
		'junit': function () {
			return new JasmineReporters.JUnitXmlReporter({
				savePath: 'specs/reports/',
				consolidateAll: true,
				consolidate: true,
				useDotNotation: true
			});
		},
		'terminal': function () {
			return new JasmineReporters.TerminalReporter({
				verbosity: 3,
				color: true,
				showStack: true,
				consolidateAll: true
			});
		}
	};
	return reporters[reportType]();
}
jasmine.loadConfig(getConfig());

jasmine.addReporter(getReport('terminal'));
jasmine.addReporter(getReport('junit'));

jasmine.configureDefaultReporter({
	showColors: true
});

jasmine.defaultReporterAdded = true;

jasmine.execute();
