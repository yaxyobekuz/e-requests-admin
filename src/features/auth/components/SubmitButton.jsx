/**
 * Auth forma uchun submit tugmasi
 * @param {{loading: boolean, label: string, loadingLabel: string}} props
 */
const SubmitButton = ({ loading, label, loadingLabel }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold py-3.5 flex justify-center items-center gap-2 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
  >
    <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
    <span className="relative">{loading ? loadingLabel : label}</span>
    {loading && (
      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative" />
    )}
  </button>
);

export default SubmitButton;
