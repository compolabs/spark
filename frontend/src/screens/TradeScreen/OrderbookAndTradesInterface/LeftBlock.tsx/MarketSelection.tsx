import styled from "@emotion/styled";
import React, { useState } from "react";
import Button, { ButtonGroup } from "@components/Button";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import Input from "@components/Input";
import SearchInput from "@components/SearchInput";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
`;

const MarketSelection: React.FC<IProps> = observer(() => {
	const [isSpotMarket, setSpotMarket] = useState(true);
	const [searchValue, setSearchValue] = useState<string>("");
	return (
		<Root>
			<ButtonGroup>
				<Button active={isSpotMarket} onClick={() => setSpotMarket(true)}>
					SPOT
				</Button>
				<Button active={!isSpotMarket} onClick={() => setSpotMarket(false)}>
					PERP
				</Button>
			</ButtonGroup>
			<SizedBox height={16} />
			<SearchInput value={searchValue} onChange={(v) => setSearchValue(v)} />
		</Root>
	);
});
export default MarketSelection;
