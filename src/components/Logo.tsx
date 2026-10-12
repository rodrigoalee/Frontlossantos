import { FaScrewdriverWrench } from "react-icons/fa6";

export default function Logo() {
  return (
    <div className="flex items-center gap-4 text-secondary">
      <FaScrewdriverWrench aria-hidden className="size-16 sm:size-22" />
      <div className="text-center leading-none">
        <p className="text-4xl font-bold sm:text-5xl">Los Santos</p>
        <p className="mt-1 text-2xl font-semibold sm:text-3xl">Customs</p>
      </div>
    </div>
  );
}
