import PropTypes from "prop-types";
import React, { Component } from "react";
import AnsiblePhasePreview from "./AnsiblePhasePreview";
import PreviewGenerator from "../../../helpers/HostedEngineSetup/PreviewGenerator";
import { deploymentStatus as status } from "../constants";
import { footerButtons } from "../../common/Wizard/Wizard";
import ReviewGenerator from "../../../helpers/HostedEngineSetup/ReviewGenerator";

class AnsiblePhasePreviewContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			heSetupModel: props.heSetupModel,
			executionStarted: false,
			executionTerminated: false,
			executionStatus: status.RUNNING,
		};

		this.customActionBtnCallback = this.customActionBtnCallback.bind(this);
		this.terminationCallBack = this.terminationCallBack.bind(this);
	}

	customActionBtnCallback() {
		this.setState({ executionStarted: true });
		const newBtnState = {
			buttonText: this.props.executeBtnText,
			disabled: true,
			disableBtnsList: [footerButtons.BACK],
			hideBtnsList: [
				footerButtons.NEXT,
				footerButtons.FINISH,
				footerButtons.CLOSE,
			],
		};
		this.props.registerCustomActionBtnStateCallback(
			newBtnState,
			this.props.stepIndex,
			this.props.subStepIndex
		); // Reset the 'Next' button after 'Execute' is pressed
	}

	terminationCallBack(executionStatus, buttonCallBack) {
		this.setState({
			executionTerminated: true,
			executionStatus: executionStatus,
		});
		const self = this;
		let btnState = {};
		if (executionStatus === status.FAILURE) {
			btnState = {
				buttonText: this.props.reattemptBtnText
					? this.props.reattemptBtnText
					: this.props.executeBtnText,
				hideBtnsList: [footerButtons.NEXT, footerButtons.FINISH],
				buttonCallBack: function () {
					const midRedeployBtnState = {
						buttonText: self.props.reattemptBtnText
							? self.props.reattemptBtnText
							: self.props.executeBtnText,
						disabled: true,
						hideBtnsList: [footerButtons.NEXT, footerButtons.FINISH],
						disableBtnsList: [footerButtons.BACK],
					};
					self.props.registerCustomActionBtnStateCallback(
						midRedeployBtnState,
						self.props.stepIndex,
						self.props.subStepIndex
					);
					buttonCallBack();
				},
			};
		} else if (this.props.isLastStep && executionStatus === status.SUCCESS) {
			btnState = {
				buttonText: "Close",
				buttonCallBack: this.props.onFinishDeploy,
				hideBtnsList: [
					footerButtons.NEXT,
					footerButtons.FINISH,
					footerButtons.CANCEL,
					footerButtons.BACK,
				],
			};
		}
		this.props.registerCustomActionBtnStateCallback(
			btnState,
			this.props.stepIndex,
			this.props.subStepIndex
		);
	}

	componentDidUpdate(prevProps) {
		if (
			prevProps.registerCustomActionBtnStateCallback === null &&
			this.props.registerCustomActionBtnStateCallback !== null &&
			this.state.executionStatus !== status.SUCCESS
		) {
			const self = this;
			const newBtnState = {
				buttonText: this.props.executeBtnText,
				buttonCallBack: self.customActionBtnCallback,
				moveNext: false,
				overrideFinish: true,
			};
			this.props.registerCustomActionBtnStateCallback(newBtnState);
		}
	}

	UNSAFE_componentWillMount() {
		let newBtnState = {};
		if (this.state.executionStatus !== status.SUCCESS) {
			newBtnState = {
				buttonText: this.props.executeBtnText,
				buttonCallBack: this.customActionBtnCallback,
				hideBtnsList: [footerButtons.NEXT, footerButtons.FINISH],
			};

			this.props.registerCustomActionBtnStateCallback(
				newBtnState,
				this.props.stepIndex,
				this.props.subStepIndex
			);
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (!this.props.validating && nextProps.validating) {
			const allowFwdStepChg =
				this.state.executionTerminated &&
				this.state.executionStatus === status.SUCCESS;
			this.props.validationCallBack(allowFwdStepChg);
		}

		return true;
	}

	render() {
		const reviewGen = new ReviewGenerator(this.state.heSetupModel);
		const sections = reviewGen.getReviewSections(this.props.sections);

		return (
			<AnsiblePhasePreview
				abortCallBack={this.props.abortCallBack}
				headerText={this.props.headerText}
				sections={sections}
				executionStarted={this.state.executionStarted}
				heSetupModel={this.state.heSetupModel}
				isLastStep={this.props.stepIndex === this.props.stepCount - 1}
				phase={this.props.phase}
				terminationCallBack={this.terminationCallBack}
			/>
		);
	}
}

AnsiblePhasePreviewContainer.propTypes = {
	headerText: PropTypes.string,
	stepName: PropTypes.string.isRequired,
	heSetupModel: PropTypes.object.isRequired,
	sections: PropTypes.array.isRequired,
	phase: PropTypes.string.isRequired,
};

export default AnsiblePhasePreviewContainer;
