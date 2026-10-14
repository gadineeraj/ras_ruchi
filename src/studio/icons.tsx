import type { ComponentType } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowsLeftRight";
import { ArrowsOutLineVerticalIcon } from "@phosphor-icons/react/dist/ssr/ArrowsOutLineVertical";
import { BookOpenIcon } from "@phosphor-icons/react/dist/ssr/BookOpen";
import { BooksIcon } from "@phosphor-icons/react/dist/ssr/Books";
import { CardsIcon } from "@phosphor-icons/react/dist/ssr/Cards";
import { ChatTeardropTextIcon } from "@phosphor-icons/react/dist/ssr/ChatTeardropText";
import { ColumnsIcon } from "@phosphor-icons/react/dist/ssr/Columns";
import { CursorClickIcon } from "@phosphor-icons/react/dist/ssr/CursorClick";
import { FilmStripIcon } from "@phosphor-icons/react/dist/ssr/FilmStrip";
import { FlagIcon } from "@phosphor-icons/react/dist/ssr/Flag";
import { FlowArrowIcon } from "@phosphor-icons/react/dist/ssr/FlowArrow";
import { GridFourIcon } from "@phosphor-icons/react/dist/ssr/GridFour";
import { HouseIcon } from "@phosphor-icons/react/dist/ssr/House";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/ssr/IdentificationCard";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { ImagesSquareIcon } from "@phosphor-icons/react/dist/ssr/ImagesSquare";
import { ListBulletsIcon } from "@phosphor-icons/react/dist/ssr/ListBullets";
import { MinusIcon } from "@phosphor-icons/react/dist/ssr/Minus";
import { NoteIcon } from "@phosphor-icons/react/dist/ssr/Note";
import { QuotesIcon } from "@phosphor-icons/react/dist/ssr/Quotes";
import { ShapesIcon } from "@phosphor-icons/react/dist/ssr/Shapes";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/ssr/SquaresFour";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { SwatchesIcon } from "@phosphor-icons/react/dist/ssr/Swatches";
import { TagIcon } from "@phosphor-icons/react/dist/ssr/Tag";
import { TextAaIcon } from "@phosphor-icons/react/dist/ssr/TextAa";
import { TextHIcon } from "@phosphor-icons/react/dist/ssr/TextH";
import { TextTIcon } from "@phosphor-icons/react/dist/ssr/TextT";

type Icon = ComponentType<{ size?: number; weight?: "regular" | "bold" | "fill" }>;

/** One icon per kind of block, for the Add panel, Layers and the toolbar. */
export const blockIcons: Record<string, Icon> = {
  Heading: TextHIcon,
  Text: TextAaIcon,
  Tagline: TextTIcon,
  Quote: QuotesIcon,
  Keywords: TagIcon,
  Facts: ListBulletsIcon,
  Button: CursorClickIcon,
  Image: ImageIcon,
  Gallery: ImagesIcon,
  StudyImages: ImagesSquareIcon,
  Video: FilmStripIcon,
  Swatches: SwatchesIcon,
  SwatchViewer: SquaresFourIcon,
  ThenNow: ArrowsLeftRightIcon,
  Section: NoteIcon,
  Columns: ColumnsIcon,
  Card: CardsIcon,
  FreeCanvas: ShapesIcon,
  Spacer: ArrowsOutLineVerticalIcon,
  Divider: MinusIcon,
  HomeHero: HouseIcon,
  CollectionCards: StackIcon,
  ShadeBoard: GridFourIcon,
  StudySheets: BooksIcon,
  ProcessSteps: FlowArrowIcon,
  PracticeWay: TextTIcon,
  Quotes: ChatTeardropTextIcon,
  PageTitle: TextHIcon,
  BackLink: ArrowLeftIcon,
  CollectionCard: BookOpenIcon,
  CollectionPager: ArrowsLeftRightIcon,
  StudyHeader: IdentificationCardIcon,
  StudyFooter: FlagIcon,
};

export function BlockIcon({ name, size = 20 }: { name: string; size?: number }) {
  const I = blockIcons[name] ?? NoteIcon;
  return <I size={size} />;
}
