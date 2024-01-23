import React from "react";

import BottomTablesInterfaceSpot from "@screens/TradeScreen/BottomTables/BottomTablesInterfaceSpot";

interface IProps {}

//todo надо сделать этот компонент более умно, я думаю в этом файле должно разруливаться что рисовать, а вся логика должга быть во вью моделях вложенных файлов
const BottomTables: React.FC<IProps> = () => {
	return <BottomTablesInterfaceSpot />;
};
export default BottomTables;
