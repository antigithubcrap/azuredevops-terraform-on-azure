import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');

async function run() {

    try {

        var templatesFilePath: string = tl.getPathInput('templatesFilePath', false, true);
        var commandPickList: string = tl.getInput('commandPickList', true);
        var terraformFilePath: string = tl.getPathInput('terraformFilePath', true, true);
        var failOnStdErrBoolean: boolean = tl.getBoolInput('failOnStdErrBoolean', false);

        if (!tl.filePathSupplied('terraformFilePath')) {
            var terraformFilePath: string = tl.which('terraform', true);
        }

        tl.cd(templatesFilePath);

        await version(terraformFilePath, failOnStdErrBoolean);

        await init(terraformFilePath, failOnStdErrBoolean);

        let commandResult: number = 0;

        switch (commandPickList) {
            case 'Output':
                commandResult = await output(terraformFilePath, failOnStdErrBoolean);
        }

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

async function init(terraformFilePath: string, failOnStdErrBoolean: boolean) {
    
    var terraformBackendConfigurationFilePath: string = tl.getPathInput('terraformBackendConfigurationFilePath', false, true);

    let terraformCommand: tr.ToolRunner = tl.tool(terraformFilePath);

    terraformCommand
        .arg('init')
        .argIf(tl.filePathSupplied('terraformBackendConfigurationFilePath'), '-backend-config=' + terraformBackendConfigurationFilePath)
        .arg('-input=false');

    await terraformCommand.exec(<any>{ failOnStdErr: failOnStdErrBoolean });
}

async function output(terraformFilePath: string, failOnStdErrBoolean: boolean) {

    let useJsonFormatBoolean: boolean = tl.getBoolInput('useJsonFormatBoolean', false);
    let outputVariablesMultiline: string = tl.getInput('outputVariablesMultiline', false);

    if (!outputVariablesMultiline) {

        console.log("No variables specified, performing a full output...");

        let terraformCommand: tr.ToolRunner = tl.tool(terraformFilePath);

        terraformCommand
            .arg('output')
            .argIf(useJsonFormatBoolean, '-json')
            .execSync(<any>{ failOnStdErr: failOnStdErrBoolean });
    }
    else {

        let variables2Output = getVariables(outputVariablesMultiline);

        if (variables2Output) {

            for (let a = 0; a < variables2Output.length; a++) {

                let terraformOutput: tr.ToolRunner = tl.tool(terraformFilePath);
                let splitedSetting = variables2Output[a].split('=', 2);

                let output = terraformOutput
                    .arg('output')
                    .argIf(useJsonFormatBoolean, '-json')
                    .arg(splitedSetting[0])
                    .execSync(<any>{ failOnStdErr: failOnStdErrBoolean });

                if (splitedSetting.length == 2) {
                    tl.setVariable(splitedSetting[1], splitedSetting[0], false);
                }
            }
        }
    }

    return new Promise<number>((resolve) => { resolve(0); });
}

function getVariables(outputVariablesMultiline: string) {
    
    return outputVariablesMultiline !== null ? outputVariablesMultiline.match(/^\w+([\-\.]\w+)*(\=\w+([\-\.]\w+)*)?$/gm) : null;
}

function isNullOrWhiteSpace(string: string) {

    if (string && string.match(/^ *$/) === null) { return false; }

    return true;
}

run();
