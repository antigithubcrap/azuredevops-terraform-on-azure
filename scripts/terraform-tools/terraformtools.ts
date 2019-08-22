import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');

async function run() {

    try {

        var commandPickList: string = tl.getInput('commandPickList', true);
        var terraformFilePath: string = tl.getPathInput('terraformFilePath', true, true);
        var failOnStdErrBoolean: boolean = tl.getBoolInput('failOnStdErrBoolean', false);

        await version(terraformFilePath, failOnStdErrBoolean);

        let commandResult: number = 0;

        switch (commandPickList) {
            case 'Install':
                commandResult = await install(terraformFilePath, failOnStdErrBoolean);
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
    
    var terraformCommand: tr.ToolRunner = tl.tool(terraformFilePath);

    await terraformCommand
        .arg('--version')
        .exec(<any>{ failOnStdErr: failOnStdErrBoolean });
}

async function init(terraformFilePath: string, templatesFilePath: string, failOnStdErrBoolean: boolean) {
    
    var manageStateBoolean: boolean = tl.getBoolInput('manageStateBoolean', false);
    var createBackendFileBoolean: boolean = tl.getBoolInput('createBackendFileBoolean', false);
    var awsRegionString: string = tl.getInput('awsRegionString', manageStateBoolean);
    var awsBucketNameString: string = tl.getInput('awsBucketNameString', manageStateBoolean);
    var awsBucketTargeFolderString: string = tl.getInput('awsBucketTargeFolderString', manageStateBoolean);

    var terraformCommand: tr.ToolRunner = tl.tool(terraformFilePath);

    terraformCommand.arg('init');

    if (manageStateBoolean) {

        if (createBackendFileBoolean) {
            
            tl.writeFile('backend.tf', 'terraform { backend "azurerm" {} }');
        }

        terraformCommand
            .arg('-backend-config=bucket=' + awsBucketNameString)
            .arg('-backend-config=key=' + awsBucketTargeFolderString + '/terraform.tfstate')
            .arg('-backend-config=region=' + awsRegionString)
            .arg('-input=false');
    }

    await terraformCommand.exec(<any>{ failOnStdErr: failOnStdErrBoolean });
}

async function install(terraformFilePath: string, failOnStdErrBoolean: boolean) {
    
    var versionPickList: string = tl.getInput('versionPickList', true);
    var customVersionString: string = tl.getInput('customVersionString', false);

    var terraformCommand: tr.ToolRunner = tl.tool(terraformFilePath);

    return terraformCommand.exec(<any>{ failOnStdErr: failOnStdErrBoolean });
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

        let variables2Set = outputVariablesMultiline.match(/.+=.*[^\s]/gm);

        if (variables2Set) {

            for (let a = 0; a < variables2Set.length; a++) {

                let terraformOutput: tr.ToolRunner = tl.tool(terraformFilePath);

                let output = terraformOutput
                    .arg('output')
                    .argIf(useJsonFormatBoolean, '-json')
                    .arg(variables2Set[a].split('=', 2)[1])
                    .execSync(<any>{ failOnStdErr: failOnStdErrBoolean });

                console.log('Setting ' + variables2Set[a].split('=', 2)[0] + ' variable with value: ' + output.stdout.replace(/[\r\n\t]/gm, ""));
                console.log("##vso[task.setvariable variable=" + variables2Set[a].split('=', 2)[0] + "]" + output.stdout.replace(/[\r\n\t]/gm, ""));
            }
        }

        let variables2Output = outputVariablesMultiline.match(/^[\w\-\.]+$/gm);

        if (variables2Output) {

            for (let a = 0; a < variables2Output.length; a++) {

                let terraformOutput: tr.ToolRunner = tl.tool(terraformFilePath);

                let output = terraformOutput
                    .arg('output')
                    .argIf(useJsonFormatBoolean, '-json')
                    .arg(variables2Output[a])
                    .execSync(<any>{ failOnStdErr: failOnStdErrBoolean });

                console.log("Variable " + output.stdout + ": " + variables2Output[a]);
            }
        }
    }

    return new Promise<number>((resolve) => { resolve(0); });
}

function getVariables() {
    
    var variablesMultiline: string = tl.getInput('variablesMultiline', false);

    return variablesMultiline !== null ? variablesMultiline.match(/\-var (\w+(\-{0,1}\w)*)+=.*[^\s]/gm) : null;
}

function isNullOrWhiteSpace(string: string) {

    if (string && string.match(/^ *$/) === null) { return false; }

    return true;
}

run();
