import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import { Link } from "react-router-dom";
import Text from "@components/Text";
import { Anchor } from "@components/Anchor";

interface ILinkGroupItem {
  name: string;
  link: string;
  outer?: boolean;
}

interface IProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  links: ILinkGroupItem[];
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  & > * {
    margin-bottom: 8px;
  }

  & > :last-child {
    margin-bottom: 0px;
  }
`;

const StyledLink = styled(Link)`
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.grey100};
`;

const StyledAnchor = styled(Anchor)`
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.grey100};
`;

const LinkGroup: React.FC<IProps> = ({ title, links, ...rest }) => {
  return (
    <Root {...rest}>
      <Text type="secondary">{title}</Text>
      {links.map(({ name, link, outer }, key) =>
        outer ? (
          <StyledAnchor href={link} key={key}>
            {name}
          </StyledAnchor>
        ) : (
          <StyledLink to={link} key={key}>
            {name}
          </StyledLink>
        )
      )}
    </Root>
  );
};
export default LinkGroup;
