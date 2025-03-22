import React, { PureComponent, Fragment } from "react";
import { AssetType } from "../defaults";

const IonAssetLabel = ({ asset, showIcon = false, ...options }) => (
	<Fragment>
		{showIcon && <i className={`${AssetType[asset].icon}`} />}
		{"  "}
		{AssetType[asset].name}
	</Fragment>
);

export default IonAssetLabel;
