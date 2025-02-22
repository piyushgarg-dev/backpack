import {
  memo,
  Suspense,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useTransition,
} from "react";
import { SectionList, StyleSheet, View } from "react-native";

import { formatUSD } from "@coral-xyz/common";
import {
  Stack,
  RoundedContainerGroup,
  Separator,
  StyledText,
} from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";
import { ErrorBoundary } from "react-error-boundary";

import { ListItemTokenPrice } from "~components/ListItem";
import { StyledTextInput } from "~components/StyledTextInput";
import {
  Screen,
  ScreenError,
  ScreenLoading,
  ScreenEmptyList,
} from "~components/index";

import data from "./TokenPriceListData.json";

const FilteredSectionList = memo(function FilteredSectionList({ filter }) {
  const navigation = useNavigation();

  const handlePressRow = (item) => {
    navigation.push("TokenPriceDetail", { tokenId: item.id, title: item.name });
  };

  const filteredSections = useMemo(() => {
    const sections = [
      {
        title: "Favorites",
        data: data.slice(0, 1),
      },
      {
        title: "Results",
        data,
      },
    ];

    return sections.map((section) => {
      return {
        title: section.title,
        data: section.data.filter((item) => {
          return item.name.toLowerCase().includes(filter);
        }),
      };
    });
  }, [filter]);

  const keyExtractor = useCallback((item) => item.id, []);
  const renderSectionHeader = useCallback(({ section }) => {
    return <StyledText mb={12}>{section.title}</StyledText>;
  }, []);

  const renderItem = useCallback(
    ({ item, section, index }) => {
      const isFirst = index === 0;
      const isLast = index === section.data.length - 1;
      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <ListItemTokenPrice
            grouped
            id={item.id}
            symbol={item.symbol}
            name={item.name}
            imageUrl={item.image}
            percentChange={item.price_change_percentage_24h}
            price={formatUSD(item.current_price)}
            onPress={() => {
              handlePressRow(item);
            }}
          />
        </RoundedContainerGroup>
      );
    },
    [handlePressRow]
  );

  return (
    <SectionList
      keyExtractor={keyExtractor}
      sections={filteredSections}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      stickySectionHeadersEnabled={false}
      ListEmptyComponent={
        <ScreenEmptyList
          iconName="settings"
          title="No results"
          subtitle="Try a dfiferent option"
        />
      }
    />
  );
});

function Container(): JSX.Element {
  const [filter, setFilter] = useState("");
  const [inputText, setInputText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChangeText = (text: string) => {
    const lowercase = text.toLowerCase();
    setFilter(lowercase);
    startTransition(() => {
      setInputText(lowercase);
    });
  };

  return (
    <Screen>
      <StyledTextInput
        placeholder="Search"
        onChangeText={handleChangeText}
        value={filter}
        style={{ marginBottom: 12 }}
      />
      <FilteredSectionList filter={filter} />
    </Screen>
  );
}

export function TokenPriceListScreen(): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container />
      </Suspense>
    </ErrorBoundary>
  );
}
