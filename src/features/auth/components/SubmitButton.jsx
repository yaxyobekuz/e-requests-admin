import Button from "@/shared/components/ui/button/Button";

/**
 * Auth forma uchun submit tugmasi
 * @param {{loading: boolean, label: string, loadingLabel: string}} props
 */
const SubmitButton = ({ loading, label, loadingLabel }) => (
  <Button
    type="submit"
    disabled={loading}
    className="w-full flex justify-center items-center gap-2"
  >
    <span>{loading ? loadingLabel : label}</span>
    {loading && (
      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    )}
  </Button>
);

export default SubmitButton;
