import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');

async function run() {

    try {

        var failOnStdErrBoolean: boolean = tl.getBoolInput('failOnStdErrBoolean', false);
        
        let commandResult = await install(failOnStdErrBoolean);
        
        tl.setResult(tl.TaskResult.Succeeded, commandResult.toString());
    }
    catch (e) {
        
        tl.setResult(tl.TaskResult.Failed, e.message);
    }
}

async function version(terraformFilePath: string, failOnStdErrBoolean: boolean) {
    
    let terraformCommand: tr.ToolRunner = tl.tool(terraformFilePath);

    await terraformCommand
        .arg('--version')
        .exec(<any>{ failOnStdErr: failOnStdErrBoolean });
}

async function install(failOnStdErrBoolean: boolean) {
    
    var versionPickList: string = tl.getInput('versionPickList', true);
    var customVersionString: string = tl.getInput('customVersionString', false);

    return new Promise<number>((resolve) => { resolve(0); });
}

function isNullOrWhiteSpace(string: string) {

    if (string && string.match(/^ *$/) === null) { return false; }

    return true;
}

run();
