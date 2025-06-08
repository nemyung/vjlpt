import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import s from "./DefaultBackButton.module.scss";

function DefaultBackButton() {
	const router = useRouter();
	const canGoBack = useCanGoBack();

	if (canGoBack === false) {
		return null;
	}

	return (
		<button
			className={s.back}
			type="button"
			onClick={() => router.history.back()}
			aria-label="뒤로가기"
		>
			<ChevronLeft className={s.icon} />
		</button>
	);
}

export default DefaultBackButton;
