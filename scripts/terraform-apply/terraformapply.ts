import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');

async function run() {

    try {

        var templatesFilePath: string = tl.getPathInput('templatesFilePath', false, true);
        var commandPickList: string = tl.getInput('commandPickList', true);
        var terraformFilePath: string = tl.getPathInput('terraformFilePath', false, true);
        var validateTemplatesBoolean: boolean = tl.getBoolInput('validateTemplatesBoolean', false);
        var failOnStdErrBoolean: boolean = tl.getBoolInput('failOnStdErrBoolean', false);

        if (!tl.filePathSupplied('terraformFilePath')) {
            var terraformFilePath: string = tl.which('terraform', true);
        }

        tl.cd(templatesFilePath);

        await version(terraformFilePath, failOnStdErrBoolean);

        await init(terraformFilePath, failOnStdErrBoolean);

        let commandResult: number = 0;

        switch (commandPickList) {
            case 'Plan':
                commandResult = await plan(terraformFilePath, validateTemplatesBoolean, failOnStdErrBoolean);
                break;
            case 'Apply':
                commandResult = await apply(terraformFilePath, validateTemplatesBoolean, failOnStdErrBoolean);
                break;
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
        .arg('-input=false')
        .argIf(tl.filePathSupplied('terraformBackendConfigurationFilePath'), '-backend-config=' + terraformBackendConfigurationFilePath);

    await terraformCommand.exec(<any>{ failOnStdErr: failOnStdErrBoolean });
}

async function validate(terraformFilePath: string, failOnStdErrBoolean: boolean) {
    
    var validateTemplatesVariablesBoolean: boolean = tl.getBoolInput('validateTemplatesVariablesBoolean', false);
    var useVariablesFileBoolean: boolean = tl.getBoolInput('useVariablesFileBoolean', false);
    var variablesFilePath: string = tl.getPathInput('variablesFilePath', true, useVariablesFileBoolean);

    let terraformCommand: tr.ToolRunner = tl.tool(terraformFilePath);

    terraformCommand
        .arg('validate');

    var variables = getVariables();

    if (variables) {
        for (var a = 0; a < variables.length; a++) {
            terraformCommand.arg(variables[a].replace('-var ', '-var='));
        }
    }

    return terraformCommand.exec(<any>{ failOnStdErr: failOnStdErrBoolean });
}

async function plan(terraformFilePath: string, validateTemplatesBoolean: boolean, failOnStdErrBoolean: boolean) {

    var saveGeneratedExecutionPlanBoolean: boolean = tl.getBoolInput('saveGeneratedExecutionPlanBoolean', false);
    var generatedExecutionPlanName: string = tl.getInput('generatedExecutionPlanName', saveGeneratedExecutionPlanBoolean);
    var useVariablesFileBoolean: boolean = tl.getBoolInput('useVariablesFileBoolean', false);
    var variablesFilePath: string = tl.getPathInput('variablesFilePath', true, useVariablesFileBoolean);

    if (validateTemplatesBoolean) {

        let validationResult: number = await validate(terraformFilePath, failOnStdErrBoolean);

        console.log('Validation result: ' + validationResult);

        if (validationResult > 0) {

            tl.setResult(tl.TaskResult.Succeeded, validationResult.toString());

            return new Promise<number>((resolve) => { resolve(validationResult); });
        }
    }

    var terraformCommand: tr.ToolRunner = tl.tool(terraformFilePath);
    
    terraformCommand
        .arg('plan')
        .argIf(saveGeneratedExecutionPlanBoolean, '-out=' + generatedExecutionPlanName);

    var variables = getVariables();

    if (variables) {
        
        for (var a = 0; a < variables.length; a++) {
            
            terraformCommand.arg(variables[a].replace('-var ', '-var='));
        }
    }

    terraformCommand
        .argIf(useVariablesFileBoolean, '-var-file=' + variablesFilePath)
        .arg('-input=false');

    return terraformCommand.exec(<any>{ failOnStdErr: failOnStdErrBoolean });
}

async function apply(terraformFilePath: string, validateTemplatesBoolean: boolean, failOnStdErrBoolean: boolean) {
    
    var useSavedExecutionPlanBoolean: boolean = tl.getBoolInput('useSavedExecutionPlanBoolean', false);
    var savedExecutionPlanName: string = tl.getInput('savedExecutionPlanName', useSavedExecutionPlanBoolean);
    var useVariablesFileBoolean: boolean = tl.getBoolInput('useVariablesFileBoolean', false);
    var variablesFilePath: string = tl.getPathInput('variablesFilePath', true, useVariablesFileBoolean);

    if (validateTemplatesBoolean && !useSavedExecutionPlanBoolean) {

        let validationResult: number = await validate(terraformFilePath, failOnStdErrBoolean);

        console.log('Validation result: ' + validationResult);

        if (validationResult > 0) {

            tl.setResult(tl.TaskResult.Succeeded, validationResult.toString());

            return new Promise<number>((resolve) => { resolve(validationResult); });
        }
    }

    var terraformCommand: tr.ToolRunner = tl.tool(terraformFilePath);

    terraformCommand
            .arg('apply')
            .arg('-auto-approve');

    var variables = getVariables();

    if (variables && !useSavedExecutionPlanBoolean) {
        
        for (var a = 0; a < variables.length; a++) {
            
            terraformCommand.arg(variables[a].replace('-var ', '-var='));
        }
    }

    terraformCommand
        .argIf(useVariablesFileBoolean && !useSavedExecutionPlanBoolean, '-var-file=' + variablesFilePath)
        .arg('-input=false')
        .argIf(useSavedExecutionPlanBoolean, savedExecutionPlanName);

    return terraformCommand.exec(<any>{ failOnStdErr: failOnStdErrBoolean });
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
