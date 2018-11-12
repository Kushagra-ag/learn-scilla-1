import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Layout from '../../components/layout';
import * as H from 'history';
// import Spinner from '../../components/spinner';
import CodeREPL from '../../components/code-repl';
import StepProgressbar from '../../components/step-progressbar';
import { IMatch } from '../../typings';
import { ButtonGroup, Button } from 'reactstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface IProps {
  i18n: {
    language: string;
    changeLanguage: (lang: string) => void;
  };
  t: (key: string) => string;
  history: H.History;
  location: H.Location;
  match: IMatch;
  accessToken: string;
  instructions?: any;
  codes?: any;
}
interface IState {
  code: string;
  codeForDiff: string;
  showAnswer: boolean;
}

export class ChapterContainer extends React.Component<IProps, IState> {
  public render(): React.ReactNode {
    const { location, history, i18n } = this.props;

    const currentLang: string = i18n.language;

    // This will be used as a key e.g. lesson1
    const lessonKey: string = this.getLessonKey();

    // This should starts from 0
    const chapterIndex: number = this.getChatperIndex();

    return (
      <Layout location={location} history={history}>
        <div>
          {this.renderStepProgressbar(lessonKey, chapterIndex)}
          <br />
          <div>{this.renderCodeREPL(lessonKey, chapterIndex, currentLang)}</div>
          <br />
          <div className="text-right">{this.renderNavButtons(lessonKey, chapterIndex)}</div>
        </div>
      </Layout>
    );
  }

  public goNext = (): void => {
    const { history, codes, match } = this.props;
    const routeParams = match.params;
    const lesson: number = parseInt(routeParams.lesson, 10);
    const chapter: number = parseInt(routeParams.chapter, 10);

    const lessonKey: string = this.getLessonKey();
    const chapterIndex: number = this.getChatperIndex();

    // Check if code is undefined
    if (codes === undefined) {
      return;
    }

    const codeChapterList = codes[lessonKey] || [];
    // Calculate total
    const total = codeChapterList.length;

    // Check if the current chapter is the end of this lesson.
    const isLastChapter = chapterIndex === total - 1;

    let nextChapterPath = `/lesson/${lesson}/chapter/${chapter + 1}`;

    // If the last chapter, go to lesson complete page
    if (isLastChapter) {
      nextChapterPath = `/lesson-complete/${lesson}`;
    }

    history.push(nextChapterPath);
  };

  private renderNavButtons = (lessonKey: string, chapterIndex: number): React.ReactNode => {
    const { t, codes } = this.props;

    // Check if code is undefined
    if (codes === undefined) {
      return null;
    }
    const codeChapterList = codes[lessonKey] || [];
    const total = codeChapterList.length;

    const isLessThanOne = chapterIndex <= 0;
    const isGreaterThanTotal = chapterIndex >= total - 1;

    return (
      <ButtonGroup>
        <Button
          outline={true}
          color="secondary"
          size="sm"
          onClick={this.goBack}
          disabled={isLessThanOne}
        >
          <FaChevronLeft />
          {t('chapter.back')}
        </Button>
        <Button
          outline={true}
          color="secondary"
          size="sm"
          onClick={this.goNext}
          disabled={isGreaterThanTotal}
        >
          {t('chapter.next')}
          <FaChevronRight />
        </Button>
      </ButtonGroup>
    );
  };

  private getLessonKey = (): string => {
    const { match } = this.props;
    const routeParams = match.params;
    const currentLesson: string = routeParams.lesson;

    // This will be used as a key e.g. lesson1
    const lessonKey: string = `lesson${currentLesson}`;
    return lessonKey;
  };

  private getChatperIndex = (): number => {
    const { match } = this.props;
    const routeParams = match.params;
    const currentChapter: number = routeParams.chapter;

    // This should starts from 0
    const chapterIndex: number = currentChapter - 1;
    return chapterIndex;
  };

  private goBack = (): void => {
    const { history, match } = this.props;
    const routeParams = match.params;

    const lesson: number = parseInt(routeParams.lesson, 10);
    const chapter: number = parseInt(routeParams.chapter, 10);

    const previousChapterPath = `/lesson/${lesson}/chapter/${chapter - 1}`;
    history.push(previousChapterPath);
  };

  private renderStepProgressbar = (lessonKey: string, chapterIndex: number): React.ReactNode => {
    const { codes } = this.props;

    // Check if code is undefined
    if (codes === undefined) {
      return null;
    }
    const codeChapterList = codes[lessonKey] || [];
    const total = codeChapterList.length;
    return (
      <div className="py-2">
        <StepProgressbar current={chapterIndex} total={total} />
      </div>
    );
  };

  private renderCodeREPL = (
    lessonKey: string,
    chapterIndex: number,
    lang: string
  ): React.ReactNode => {
    const { instructions, codes, t } = this.props;

    if (codes === undefined || instructions === undefined || instructions[lang] === undefined) {
      return null;
    }

    const intructionsLocalized = instructions[lang];
    const instructionChapterList = intructionsLocalized[lessonKey] || [];
    const instruction = instructionChapterList[chapterIndex] || {};

    const codeChapterList = codes[lessonKey] || [];
    const code = codeChapterList[chapterIndex] || {};
    const initialCode = code.initialCode;
    const answerCode = code.answerCode;

    return (
      <CodeREPL
        initialCode={initialCode}
        answerCode={answerCode}
        instruction={instruction}
        t={t}
        goNext={this.goNext}
      />
    );
  };
}

const WithTranslation = translate('translations')(ChapterContainer);

const mapStateToProps = (state) => ({
  accessToken: state.persist.accessToken,
  instructions: state.course.lessonIntructions,
  codes: state.course.lessonCodes
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WithTranslation);