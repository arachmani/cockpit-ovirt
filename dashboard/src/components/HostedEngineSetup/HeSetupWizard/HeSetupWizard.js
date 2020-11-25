import React from "react";
import {
	deploymentTypes,
	status,
	messages,
	ansiblePhases,
	wizardSections as sectNames,
	headers,
	InvalidNetworkInterfacesMsg,
} from "../constants";
import HeWizardNetworkContainer from "../NetworkStep/HeWizardNetworkContainer";
import HeWizardEngineContainer from "../EngineStep/HeWizardEngineContainer";
import HeWizardStorageContainer from "../StorageStep/HeWizardStorageContainer";
import HeWizardVmContainer from "../VmStep/HeWizardVmContainer";
import HeWizardPreviewContainer from "../PreviewStep/HeWizardPreviewContainer";
import Wizard from "../../common/Wizard/Wizard";
import MultiPartStepContainer from "../../common/Wizard/MultiPartStep/MultiPartStepContainer";
import AnsiblePhasePreviewContainer from "../AnsiblePhasePreview/AnsiblePhasePreviewContainer";

const HeSetupWizard = ({
	abortCallback,
	defaultsProvider,
	deploymentType,
	handleFinish,
	handleRedeploy,
	heSetupModel,
	isDeploymentStarted,
	loadingState,
	onSuccess,
	onStepChange,
	setup,
	sufficientMemAvail,
	systemData,
	libvirtRunning,
	virtSupported,
	systemDataRetrieved,
	gDeployAnswerFilePaths,
	showWizard,
	networkIfacesRetrieved,
}) => {
	return (
		<div id="wizard-outer-div" style={showWizard ? {} : { display: "none" }}>
			{loadingState === status.POLLING && (
				<div className="curtains curtains-ct blank-slate-pf he-data-loading-container">
					<div className="container-center">
						<div className="spinner" />
						<br />
						<h1>Loading Wizard</h1>
					</div>
				</div>
			)}

			{loadingState === status.SUCCESS &&
				deploymentType === deploymentTypes.ANSIBLE_DEPLOYMENT && (
					<Wizard
						title="Hosted Engine Deployment"
						onClose={abortCallback}
						onFinish={handleFinish}
						onStepChange={onStepChange}
						suppressDataDismissAttribute={showWizard}
						isDeploymentStarted={isDeploymentStarted}
					>
						<HeWizardVmContainer
							stepName="VM"
							deploymentType={deploymentType}
							model={heSetupModel}
							systemData={systemData}
							defaultsProvider={defaultsProvider}
						/>
						<HeWizardEngineContainer
							stepName="Engine"
							deploymentType={deploymentType}
							heSetupModel={heSetupModel.model}
						/>
						<AnsiblePhasePreviewContainer
							abortCallBack={abortCallback}
							stepName="Prepare VM"
							headerText={headers.PREPARE_VM_STEP}
							executeBtnText="Prepare VM"
							heSetupModel={heSetupModel.model}
							sections={[sectNames.VM, sectNames.ENGINE]}
							phase={ansiblePhases.BOOTSTRAP_VM}
						/>
						<HeWizardStorageContainer
							stepName="Storage"
							deploymentType={deploymentType}
							model={heSetupModel}
						/>
						<AnsiblePhasePreviewContainer
							abortCallBack={abortCallback}
							isLastStep={true}
							stepName="Finish"
							headerText={headers.FINISH_STEP}
							executeBtnText="Finish Deployment"
							reattemptBtnText="Redeploy"
							heSetupModel={heSetupModel.model}
							sections={[sectNames.STORAGE]}
							phase={ansiblePhases.CREATE_STORAGE}
						/>
					</Wizard>
				)}

			{loadingState === status.SUCCESS &&
				deploymentType === deploymentTypes.OTOPI_DEPLOYMENT && (
					<Wizard
						title="Hosted Engine Deployment"
						onClose={abortCallback}
						onFinish={handleFinish}
						onStepChange={onStepChange}
						isDeploymentStarted={isDeploymentStarted}
					>
						<HeWizardVmContainer
							stepName="VM"
							deploymentType={deploymentType}
							model={heSetupModel}
							systemData={systemData}
							defaultsProvider={defaultsProvider}
						/>
						<HeWizardEngineContainer
							stepName="Engine"
							deploymentType={deploymentType}
							heSetupModel={heSetupModel.model}
						/>
						<HeWizardStorageContainer
							stepName="Storage"
							deploymentType={deploymentType}
							model={heSetupModel}
						/>
						<HeWizardNetworkContainer
							stepName="Network"
							deploymentType={deploymentType}
							heSetupModel={heSetupModel.model}
							systemData={systemData}
							defaultsProvider={defaultsProvider}
						/>
						<HeWizardPreviewContainer
							stepName="Review"
							deploymentType={deploymentType}
							heSetupModel={heSetupModel.model}
							isDeploymentStarted={isDeploymentStarted}
							onSuccess={onSuccess}
							reDeployCallback={handleRedeploy}
							setup={setup}
							abortCallback={abortCallback}
							gDeployAnswerFilePaths={gDeployAnswerFilePaths}
						/>
					</Wizard>
				)}

			<div
				style={loadingState === status.FAILURE ? {} : { display: "none" }}
				className="he-error-msg-container-outer"
			>
				<div className="he-error-msg-container-inner">
					{!virtSupported && (
						<div className="container">
							<div className="alert alert-danger he-error-msg">
								<span className="pficon pficon-error-circle-o" />
								<strong>{messages.VIRT_NOT_SUPPORTED}</strong>
							</div>
						</div>
					)}

					{!systemDataRetrieved && (
						<div className="container">
							<div className="alert alert-danger he-error-msg">
								<span className="pficon pficon-error-circle-o" />
								<strong>{messages.SYS_DATA_UNRETRIEVABLE}</strong>
							</div>
							{!networkIfacesRetrieved && (
								<div className="alert alert-warning he-warning-msg">
									<span className="pficon pficon-warning-triangle-o" />
									<InvalidNetworkInterfacesMsg />
								</div>
							)}
						</div>
					)}

					{!sufficientMemAvail && (
						<div className="container">
							<div className="alert alert-danger he-error-msg">
								<span className="pficon pficon-error-circle-o" />
								<strong>{messages.INSUFFICIENT_MEM_AVAIL}</strong>
							</div>
						</div>
					)}
					{!libvirtRunning && (
						<div className="container">
							<div className="alert alert-danger he-error-msg">
								<span className="pficon pficon-error-circle-o" />
								<strong>{messages.LIBVIRT_NOT_RUNNING}</strong>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default HeSetupWizard;
