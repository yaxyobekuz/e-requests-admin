// Utils
import { cn } from "@/shared/utils/cn";

// React mask
import { IMaskInput } from "react-imask";

// Components
import { inputBaseClasses } from "./Input";

const InputTel = ({ className = "", ...props }) => {
  return (
    <IMaskInput
      type="tel"
      placeholder="+998 "
      value={props.value}
      mask="+{998} (00) 000-00-00"
      className={cn(className, inputBaseClasses)}
    />
  );
};

export default InputTel;
