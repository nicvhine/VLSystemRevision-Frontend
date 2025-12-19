'use client';

type Props = {
  usernameOrEmail: string;
  setUsernameOrEmail: (val: string) => void;
  error: string;
  handleSearchAccount: () => void;
};

export default function StepAccount({
  usernameOrEmail,
  setUsernameOrEmail,
  error,
  handleSearchAccount,
}: Props) {
  return (
    <div className="text-center">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Find Your Account
      </h2>
      <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
        To reset your password, please enter your registered{" "}
        <span className="font-medium text-gray-800">email address</span> or{" "}
        <span className="font-medium text-gray-800">username</span>.
      </p>

      {/* Input Field */}
      <div className="max-w-md mx-auto text-left bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <label
          htmlFor="usernameOrEmail"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email or Username
        </label>
        <input
          id="usernameOrEmail"
          type="text"
          placeholder="e.g. johndoe@example.com"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          className={`w-full border ${
            error ? "border-red-400" : "border-gray-300"
          } rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition`}
        />

        {/* Error Message */}
        {error && (
          <div className="mt-2 flex items-start gap-2 text-sm text-red-600 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSearchAccount}
            disabled={!usernameOrEmail}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:scale-95 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
