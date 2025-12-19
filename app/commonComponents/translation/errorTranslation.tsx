const errorTranslation = {
	en: {
		// General/network/system
		noToken: "No token found in localStorage",
		networkNotOk: "Network response was not ok",
		genericError: "Error: {reason}",
		genericTryAgain: "An error occurred. Please try again.",
		serverErrorTryAgain: "Server error. Please try again.",

		// Email/SMS sending
		emailFailed: "Email failed: {reason}",
		failedToSendVerificationEmail: "Failed to send verification code.",
		failedToSendVerificationSms: "Failed to send verification code via SMS.",
		emailNotFoundOrCouldNotBeSent: "Email not found or could not be sent.",

		// Auth / Login / Password
		usernamePasswordRequired: "Please enter both username and password.",
		invalidCredentials: "Invalid credentials or user not found.",
		incorrectVerificationCode: "Incorrect verification code.",
		invalidOtp: "Invalid OTP. Please try again.",
		passwordsDoNotMatch: "Passwords do not match.",
		passwordResetFailed: "Password reset failed.",
		serverConnectionError: "Error connecting to the server.",

		// Account / Settings
		accountNotFoundOrEmailMismatch: "Account not found or email does not match.",
		emailAlreadyInUse: "Email already in use.",
		phoneAlreadyInUse: "Phone number already in use.",
		failedToUpdateEmail: "Failed to update email.",
		failedToUpdatePhone: "Failed to update phone number.",
		failedToUpdatePassword: "Failed to update password.",
		accountSettingsUpdateFailed: "Failed to update account settings.",
		invalidAccountRole: "Invalid account role.",
		validEmailRequired: "Please enter a valid email address.",
		validPhoneRequired: "Please enter a valid phone number.",
		verifyNewEmailBeforeSaving: "Please verify your new email before saving.",

		// Loan Simulator / Apply Loan validations
		selectLoanType: "Please select a loan type.",
		selectLoanAmount: "Please select a loan amount.",
		completeRequiredFields: "Please complete all required fields before submitting.",
		docsRequired: "Supporting documents must be uploaded.",
		invalidCustomAmountForType: "Not a valid amount for this loan type.",

		// References and name/phone validations
		invalidNameFormat: "Invalid name format.",
		nameTwoWords: "Name must have at least two words.",
		nameNotApplicant: "Reference name cannot be applicant's name.",
		duplicateName: "Duplicate name not allowed.",
		contactMax11: "Contact must be up to 11 digits.",
		invalidPhoneFormat: "Invalid phone number format",
		duplicateContact: "Duplicate contact number not allowed.",
		contactNotApplicant: "Reference contact cannot be applicant's contact number.",

		// Amount range messages (placeholders)
		amountBelowMin: "Amount is below the minimum allowed ({minAmount}).",
		amountAboveMax: "Amount exceeds the maximum allowed ({maxAmount}).",

		// Schedule Interview
		setDateTime: "Please set both date and time before saving.",
		interviewDateRange: "Interview date must be within seven days of the application and not in the past.",
		invalidInterviewTime: "Please provide a valid interview time.",
		interviewTimeWindow: "Interview time must be between 9:00 AM and 6:00 PM.",
			failedToUpdateSchedule: "Failed to update schedule.",

		// Misc
		missingCollector: "Please select a collector.",
		dateInFuture: "Date cannot be in the future.",
		maxWordsAllowed: "Maximum {maxWords} words allowed.",

			// Application tracker / general
			invalidApplicationId: "Please enter a valid Application ID.",
			applicationNotFound: "Application not found.",
			somethingWentWrongTryLater: "Something went wrong. Please try again later.",

			// Backend-auth surfaced errors
			accessTokenRequired: "Access token required.",
			invalidOrExpiredToken: "Invalid or expired token.",
			noTokenProvided: "No token provided.",
			invalidToken: "Invalid token.",
			unauthorizedRole: "Access denied: Unauthorized role.",

			// Backend-borrowers surfaced errors
			noAccountFoundWithUsernameEmail: "No account found with that username and email.",
			borrowersIdRequired: "borrowersId is required.",
			borrowerNotFound: "Borrower not found.",
			otpExpired: "OTP expired.",
			noOtpFound: "No OTP found.",
			passwordPolicyNotMet: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",

			// Backend-loan application validations
			agentMustBeSelected: "Agent must be selected for this application.",
			selectedAgentDoesNotExist: "Selected agent does not exist.",
			invalidAgentIdFormat: "Invalid agent ID format.",
			invalidReferenceFormat: "Invalid format for character references.",
			threeReferencesRequired: "Three references must be provided.",
			referenceUniqueRequired: "Reference names and contact numbers must be unique.",
			collateralFieldsRequired: "All collateral fields are required.",
			businessFieldsRequired: "Business fields are required for business income source.",
			employmentFieldsRequired: "Employment fields are required for employed income source.",
			invalidSourceOfIncome: "Invalid source of income.",
			pendingApplicationExists: "You already have a pending application with these details.",
			borrowerInfoNotFound: "Borrower information not found.",
			allReloanFieldsRequired: "All reloan fields must be provided.",
			noActiveLoanFound: "No active loan found for this borrower.",

			// Backend-collection surfaced errors
			noteMustBeString: "Note must be a string.",
			noPaymentScheduleFound: "No payment schedule found for this borrower and loan.",
			failedToLoadCollectors: "Failed to load collectors.",
			failedToFetchCollectionStats: "Failed to fetch collection stats.",
			internalServerError: "Internal server error.",

			// Backend misc fetch failures
			failedToFetchInterviews: "Failed to fetch interviews.",
			failedToFetchLoanTypeStatistics: "Failed to fetch loan type statistics.",
			failedToFetchStatistics: "Failed to fetch statistics.",
			failedToFetchMonthlyStatistics: "Failed to fetch monthly statistics.",
	},
	ceb: {
		// General/network/system
		noToken: "Walay token nga nakit-an sa localStorage",
		networkNotOk: "Dili maayong tubag sa network",
		genericError: "Sayop: {reason}",
		genericTryAgain: "Adunay sayop. Palihog sulayi pag-usab.",
		serverErrorTryAgain: "Sayop sa server. Palihog sulayi pag-usab.",

		// Email/SMS sending
		emailFailed: "Napakyas ang email: {reason}",
		failedToSendVerificationEmail: "Napakyas sa pagpadala sa verification code.",
		failedToSendVerificationSms: "Napakyas sa pagpadala sa verification code pinaagi sa SMS.",
		emailNotFoundOrCouldNotBeSent: "Wala makit-i ang email o dili mapadala.",

		// Auth / Login / Password
		usernamePasswordRequired: "Palihog isulod ang username ug password.",
		invalidCredentials: "Sayop ang kredensyal o wala makit-i ang user.",
		incorrectVerificationCode: "Sayop ang verification code.",
		invalidOtp: "Dili husto ang OTP. Palihog sulayi pag-usab.",
		passwordsDoNotMatch: "Dili pareho ang mga password.",
		passwordResetFailed: "Napakyas ang pag-reset sa password.",
		serverConnectionError: "Sayop sa pagkonektar sa server.",

		// Account / Settings
		accountNotFoundOrEmailMismatch: "Wala makit-i ang account o dili tugma ang email.",
		emailAlreadyInUse: "Gigamit na ang email.",
		phoneAlreadyInUse: "Gigamit na ang numero sa telepono.",
		failedToUpdateEmail: "Napakyas sa pag-update sa email.",
		failedToUpdatePhone: "Napakyas sa pag-update sa numero sa telepono.",
		failedToUpdatePassword: "Napakyas sa pag-update sa password.",
		accountSettingsUpdateFailed: "Napakyas sa pag-update sa mga setting sa account.",
		invalidAccountRole: "Dili balido ang papel sa account.",
		validEmailRequired: "Palihog ibutang ang sakto nga email address.",
		validPhoneRequired: "Palihog ibutang ang husto nga numero sa telepono.",
		verifyNewEmailBeforeSaving: "Palihog i-verify ang imong bag-ong email sa dili pa i-save.",

		// Loan Simulator / Apply Loan validations
		selectLoanType: "Palihog pagpili ug klase sa pahulam.",
		selectLoanAmount: "Palihog pagpili ug kantidad sa pahulam.",
		completeRequiredFields: "Palihog kompleta-a ang tanang gikinahanglan nga mga field sa dili pa isumite.",
		docsRequired: "Kinahanglan i-upload ang mga supporting documents.",
		invalidCustomAmountForType: "Dili valid nga kantidad alang ni nga klase sa pahulam.",

		// References and name/phone validations
		invalidNameFormat: "Sayop ang porma sa ngalan.",
		nameTwoWords: "Ang ngalan kinahanglan adunay labing menos duha ka pulong.",
		nameNotApplicant: "Ang ngalan sa reference dili mahimong pareho sa ngalan sa aplikante.",
		duplicateName: "Dili pwede ang parehas nga ngalan.",
		contactMax11: "Hangtud ra sa 11 ka numero ang contact.",
		invalidPhoneFormat: "Sayop nga porma sa numero sa telepono.",
		duplicateContact: "Dili pwede ang parehas nga numero sa contact.",
		contactNotApplicant: "Ang contact sa reference dili mahimong pareho sa contact sa aplikante.",

		// Amount range messages (placeholders)
		amountBelowMin: "Mas ubos sa minimum nga kantidad ({minAmount}).",
		amountAboveMax: "Molapas sa maximum nga kantidad ({maxAmount}).",

		// Schedule Interview
		setDateTime: "Palihog ibutang ang petsa ug oras sa dili pa i-save.",
		interviewDateRange: "Ang petsa sa interview kinahanglan sulod sa pito ka adlaw gikan sa aplikasyon ug dili sa milabay.",
		invalidInterviewTime: "Palihog paghatag ug husto nga oras sa interview.",
		interviewTimeWindow: "Ang oras sa interview dapat tali sa 9:00 AM ug 6:00 PM.",
			failedToUpdateSchedule: "Napakyas sa pag-update sa schedule.",

		// Misc
		missingCollector: "Palihog pagpili ug collector.",
		dateInFuture: "Ang petsa dili mahimong sa umaabot.",
		maxWordsAllowed: "Maximum {maxWords} ka pulong lang ang gitugotan.",

			// Application tracker / general
			invalidApplicationId: "Palihog isulod ang balidong Application ID.",
			applicationNotFound: "Wala makita ang aplikasyon.",
			somethingWentWrongTryLater: "Adunay problema. Palihug sulayi pag-usab unya.",

			// Backend-auth surfaced errors
			accessTokenRequired: "Gikinahanglan ang access token.",
			invalidOrExpiredToken: "Dili balido o wala na'y bisa nga token.",
			noTokenProvided: "Walay token nga gihatag.",
			invalidToken: "Dili balido nga token.",
			unauthorizedRole: "Dili tugotan: Dili awtorisado ang papel.",

			// Backend-borrowers surfaced errors
			noAccountFoundWithUsernameEmail: "Walay account nga nakit-an gamit ang maong username ug email.",
			borrowersIdRequired: "Gikinahanglan ang borrowersId.",
			borrowerNotFound: "Wala makita ang borrower.",
			otpExpired: "Wala na'y bisa ang OTP.",
			noOtpFound: "Walay nakit-ang OTP.",
			passwordPolicyNotMet: "Ang password kinahanglan labing meno 8 ka karakter ug may dakong letra, gamayng letra, numero, ug espesyal nga karakter.",

			// Backend-loan application validations
			agentMustBeSelected: "Kinahanglan pilion ang agent para ani nga aplikasyon.",
			selectedAgentDoesNotExist: "Wala maglungtad ang napiling agent.",
			invalidAgentIdFormat: "Sayop ang porma sa agent ID.",
			invalidReferenceFormat: "Sayop ang porma sa character references.",
			threeReferencesRequired: "Tulo ka reference ang gikinahanglan.",
			referenceUniqueRequired: "Kinahanglan lahi-lahi ang mga ngalan ug numero sa reference.",
			collateralFieldsRequired: "Kinahanglan kompleto ang tanang field sa collateral.",
			businessFieldsRequired: "Kinahanglan ang business nga mga field kung pinanggikan sa negosyo ang kita.",
			employmentFieldsRequired: "Kinahanglan ang employment nga mga field kung empleyado ang pinanggikan sa kita.",
			invalidSourceOfIncome: "Dili balido ang pinanggikan sa kita.",
			pendingApplicationExists: "Aduna na kay pending nga aplikasyon gamit ang maong detalye.",
			borrowerInfoNotFound: "Wala makita ang impormasyon sa borrower.",
			allReloanFieldsRequired: "Kinahanglan kompleto ang tanang field sa reloan.",
			noActiveLoanFound: "Walay aktibong utang nga nakit-an para aning borrower.",

			// Backend-collection surfaced errors
			noteMustBeString: "Ang note kinahanglan usa ka string.",
			noPaymentScheduleFound: "Walay payment schedule alang aning borrower ug utang.",
			failedToLoadCollectors: "Napakyas sa pag-load sa mga collector.",
			failedToFetchCollectionStats: "Napakyas sa pagkuha sa statistics sa koleksyon.",
			internalServerError: "Sulod nga sayop sa server.",

			// Backend misc fetch failures
			failedToFetchInterviews: "Napakyas sa pagkuha sa mga interview.",
			failedToFetchLoanTypeStatistics: "Napakyas sa pagkuha sa statistics sa klase sa loan.",
			failedToFetchStatistics: "Napakyas sa pagkuha sa statistics.",
			failedToFetchMonthlyStatistics: "Napakyas sa pagkuha sa buwanang statistics.",
	},
};

export default errorTranslation;

