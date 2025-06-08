import type { ReactNode } from "react";

import DefaultBackButton from "./DefaultBackbutton";
import s from "./Header.module.scss";

type Props = {
	leftPositionElement?: ReactNode;
	rightPositionElement?: ReactNode;
	title: string;
};

function Header({
	leftPositionElement = <DefaultBackButton />,
	rightPositionElement = null,
	title,
}: Props) {
	return (
		<header className={s.outer}>
			{leftPositionElement}
			<h1 className={s.title}>{title}</h1>
			{rightPositionElement}
		</header>
	);
}

export default Header;
