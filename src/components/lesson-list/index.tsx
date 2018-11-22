import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withFirebase } from 'react-redux-firebase';

const LessonList: React.SFC<any> = (props) => {
  const { t, profile, lessonList } = props;
  const list = lessonList || [];
  return list.map((item, index) => {
    const lessonNum: number = index + 1;
    const lessonKey: string = `lesson${lessonNum}`;

    const progressProfile = profile.progress || {};
    const lessonProgressNum: number = progressProfile[lessonKey] || 0;

    const isLoaded: boolean = profile.isLoaded;

    const chapters: string[] = item.chapters || [];
    const totalNum: number = chapters.length;

    const progressText = isLoaded ? `[${lessonProgressNum}/${totalNum}]` : '';
    const chapterToStart = totalNum <= lessonProgressNum ? totalNum : lessonProgressNum + 1;

    const startingLessonPath = `/lesson/${lessonNum}/chapter/${chapterToStart}`;
    return (
      <div key={startingLessonPath} style={{ margin: 10 }}>
        <Link className="btn btn-primary btn-block text-left" to={startingLessonPath}>
          {`${t('lesson.lesson')} ${lessonNum}`} : {`${item.title} ${progressText}`}
        </Link>
      </div>
    );
  });
};

const mapStateToProps = (state) => ({
  profile: state.firebase.profile
});

export default compose(
  withFirebase,
  connect(mapStateToProps)
)(LessonList);
