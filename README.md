# Azure DevOps / Terraform on Azure

This is the home page for the Azure DevOps / Terraform on Azure (with best practices) task source code repositories.  

Terraform on Azure (with best practices) is a open-source and cross-platform Azure DevOps task that enables terraforming capabilities over the Azure Cloud. It was created to provide an optimized and secure way to terraform on Azure.  

## Tools  

[TypeScript 3.5.3 or greater](https://www.npmjs.com/package/typescript) installable as NPM global package  

[tfx-cli 0.7.9 or greater](https://www.npmjs.com/package/tfx-cli) installable as NPM global package  

[GraphicsMagick 1.3.33 Q16 or greater](http://www.graphicsmagick.org/)  

[Node 10.16.2 (LST) or greater (comes with NPM >= 6.9.0)](https://nodejs.org/)  

## Get Started  

Just follow the next 5 tasks.

### Install tools

### Download sources  

Type **git clone https://github.com/antigithubcrap/azuredevops-terraform-on-azure.git**  

### Compile  

Type **tsc** from the root of the task folder. That should have compiled all the **.ts** files.  

### Gulp  

Type **gulp** from the root of the task folder (install GraphicsMagick before gulping).  

### TFX  

Type **tfx extension create --manifest vss-extension.json** from the root of the task folder.  