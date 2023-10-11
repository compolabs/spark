import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { ReactComponent as ArrowDown } from "@src/assets/icons/arrowDown.svg";
import { ReactComponent as ArrowUp } from "@src/assets/icons/arrowUp.svg";
import useOnClickOutside from "@src/hooks/useOnClickOutside";
import SizedBox from "@components/SizedBox";

//todo отрефакторить цвета
type IOption = {
  id: number;
  value: string;
};

interface IProps {
  options: IOption[];
  placeholder: string;
  setSelectedOption: (option: IOption) => void;
  disabled?: boolean;
  label?: string;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  //width: 100%;
`;

const Label = styled.div`
  color: #676767;
  font-family: Space Grotesk;
  font-size: 8px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 1.12px;
`;

const StyledSelect = styled.div<{ disabled?: boolean; active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;

  border-radius: 4px;
  background: #050505;
  border: 1px solid ${({ active }) => (active ? "#969696" : "#050505")};

  :hover {
    border: 1px solid #676767;
  }
`;

const StyledOptions = styled.div`
  position: absolute;
  max-height: 180px;
  height: auto;
  overflow-y: auto;
  top: 40px;
  width: 100%;
  padding: 4px 0;
  border-radius: 4px;
  border: 1px solid var(--Gray-01, #969696);
  background: #050505;
`;

const StyledOption = styled.div<{ isSelected: boolean }>(
  ({ isSelected }) => css`
    padding: 8px 10px;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    cursor: pointer;

    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    color: #969696;

    ${isSelected && `color: #FFF`}
    &:hover {
      color: #fff;
    }

    p {
      margin-top: 2px;
      font-size: 13px;
      opacity: 0.7;
    }
  `
);
const Input = styled.input`
  background: salmon;
  color: #fffffd;
  font-family: Space Grotesk;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  border: none;
  //height: 39px;
  width: 100%;

  &:focus {
    outline: none;
  }
`;

export const StyledSelected = styled.div<{ selected: boolean }>(
  ({ selected }) => css`
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 40px;

    //todo придумать как сделать чтобы не прыгал компонент после выбора инпута
    div {
      padding-left: 10px;
      background: cyan;
      //min-width: 160px;
      height: 31px;
      display: flex;
      align-items: center;
      color: #fffffd;
      box-sizing: border-box;

      font-family: Space Grotesk;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }

    //arrows block
    > span {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      &:after {
        content: "";
        position: absolute;
        height: 24px;
        width: 24px;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.1);
        display: none;
      }

      &:hover:after {
        display: block;
      }
    }
  `
);

const Select: React.FC<IProps> = ({
  options,
  placeholder,
  setSelectedOption,
  disabled,
  label
}) => {
  const ref = React.useRef(null);
  const [keyword, setKeyword] = React.useState("");
  const [selected, setSelected] = React.useState<null | number>(null);
  const [isOptionsVisible, setIsOptionsVisible] = React.useState(false);

  useOnClickOutside(ref, () => setIsOptionsVisible(false));

  return (
    <Root>
      <Label>{label?.toUpperCase()}</Label>
      <SizedBox height={4} />
      <StyledSelect ref={ref} disabled={disabled} active={isOptionsVisible}>
        <StyledSelected selected={selected != null}>
          <div onClick={() => setIsOptionsVisible(!isOptionsVisible)}>
            {selected !== null ? (
              <span datatype="text">{options[selected].value}</span>
            ) : (
              <Input
                type="text"
                placeholder={placeholder}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value.toLowerCase())}
                onClick={() => setIsOptionsVisible(!isOptionsVisible)}
              />
            )}
          </div>
          <span onClick={() => setIsOptionsVisible(!isOptionsVisible)}>
            {isOptionsVisible ? <ArrowUp /> : <ArrowDown />}
          </span>
        </StyledSelected>

        {/*todo add no items found*/}
        {isOptionsVisible && (
          <StyledOptions>
            {options
              .filter((option) => option.value.toLowerCase().includes(keyword))
              .map((option, index) => (
                <StyledOption
                  key={option.id}
                  title={option.value}
                  isSelected={selected === index}
                  onClick={() => {
                    setKeyword("");
                    setSelected(index);
                    setSelectedOption(option);
                    setIsOptionsVisible(!isOptionsVisible);
                  }}
                >
                  <span>{option.value}</span>
                </StyledOption>
              ))}
          </StyledOptions>
        )}
      </StyledSelect>
    </Root>
  );
};

export default Select;
