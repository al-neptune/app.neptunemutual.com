import CloseIcon from "@/icons/CloseIcon";

export const ModalCloseButton = ({ onClick, disabled }) => (
  <button
    onClick={disabled ? () => {} : onClick}
    className="absolute flex items-center justify-center text-black rounded right-6 top-6 sm:right-8 sm:top-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-364253"
    title="Close"
    data-testid="modal-close-button"
  >
    <span className="sr-only">Close</span>
    <CloseIcon width={24} height={24} />
  </button>
);
