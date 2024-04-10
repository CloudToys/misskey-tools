import React, { useEffect, useState } from 'react';

import { LOCALSTORAGE_KEY_TOKEN } from '../const';
import { useGetSessionQuery } from '../services/session';
import { Skeleton } from '../components/Skeleton';
import { IAnnouncement } from '../../common/types/announcement';
import { $delete, $get, $post, $put } from '../misc/api';
import { showModal } from '../store/slices/screen';
import { useDispatch } from 'react-redux';
import { useTitle } from '../hooks/useTitle';
import { Log } from '../../common/types/log';
import { LogView } from '../components/LogView';


export const AdminPage: React.VFC = () => {
  const { data, error } = useGetSessionQuery(undefined);

  const dispatch = useDispatch();

  useTitle('_sidebar.admin');

  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [selectedAnnouncement, selectAnnouncement] = useState<IAnnouncement | null>(null);
  const [isAnnouncementsLoaded, setAnnouncementsLoaded] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [isDeleteMode, setDeleteMode] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');

  const [misshaiLog, setMisshaiLog] = useState<Log[] | null>(null);

  const submitAnnouncement = async () => {
    if (selectedAnnouncement) {
      await $put('announcements', {
        id: selectedAnnouncement.id,
        title: draftTitle,
        body: draftBody,
      });
    } else {
      await $post('announcements', {
        title: draftTitle,
        body: draftBody,
      });
    }
    selectAnnouncement(null);
    setDraftTitle('');
    setDraftBody('');
    setEditMode(false);
    fetchAll();
  };

  const deleteAnnouncement = ({id}: IAnnouncement) => {
    $delete('announcements', {id}).then(() => {
      fetchAll();
    });
  };

  const fetchAll = () => {
    setAnnouncements([]);
    setAnnouncementsLoaded(false);
    $get<IAnnouncement[]>('announcements').then(announcements => {
      setAnnouncements(announcements ?? []);
      setAnnouncementsLoaded(true);
    });
    fetchLog();
  };

  const fetchLog = () => {
    $get<Log[]>('admin/misshai/log').then(setMisshaiLog);
  };

  const onClickStartMisshaiAlertWorkerButton = () => {
    $post('admin/misshai/start').then(() => {
      dispatch(showModal({
        type: 'dialog',
        message: '開始',
      }));
    }).catch((e) => {
      dispatch(showModal({
        type: 'dialog',
        icon: 'error',
        message: e.message,
      }));
    });
  };

  /**
   * Session APIのエラーハンドリング
   * このAPIがエラーを返した = トークンが無効 なのでトークンを削除してログアウトする
   */
  useEffect(() => {
    if (error) {
      console.error(error);
      localStorage.removeItem(LOCALSTORAGE_KEY_TOKEN);
      location.reload();
    }
  }, [error]);

  /**
   * Edit Modeがオンのとき、Delete Modeを無効化する（誤操作防止）
   */
  useEffect(() => {
    if (isEditMode) {
      setDeleteMode(false);
    }
  }, [isEditMode]);

  /**
   * お知らせ取得
   */
  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (selectedAnnouncement) {
      setDraftTitle(selectedAnnouncement.title);
      setDraftBody(selectedAnnouncement.body);
    } else {
      setDraftTitle('');
      setDraftBody('');
    }
  }, [selectedAnnouncement]);

  return !data || !isAnnouncementsLoaded ? (
    <div className="vstack">
      <Skeleton width="100%" height="1rem" />
      <Skeleton width="100%" height="1rem" />
      <Skeleton width="100%" height="2rem" />
      <Skeleton width="100%" height="160px" />
    </div>
  ) : (
    <div className="fade vstack">
      {
        !data.isAdmin ? (
          <p>이 리소스에 접근할 권한이 없습니다.</p>
        ) : (
          <>
            <div className="card shadow-2">
              <div className="body">
                <h1>공지사항</h1>
                {!isEditMode && (
                  <label className="input-switch mb-2">
                    <input type="checkbox" checked={isDeleteMode} onChange={e => setDeleteMode(e.target.checked)}/>
                    <div className="switch"></div>
                    <span>여기를 눌러 삭제 모드르 진입</span>
                  </label>
                )}
                { !isEditMode ? (
                  <>
                    {isDeleteMode && <div className="ml-2 text-danger">삭제할 항목을 선택해주세요.</div>}
                    <div className="large menu">
                      {announcements.map(a => (
                        <button className="item fluid" key={a.id} onClick={() => {
                          if (isDeleteMode) {
                            deleteAnnouncement(a);
                          } else {
                            selectAnnouncement(a);
                            setEditMode(true);
                          }
                        }}>
                          {isDeleteMode && <i className="icon bi fas fa-trash-can text-danger" />}
                          {a.title}
                        </button>
                      ))}
                      {!isDeleteMode && (
                        <button className="item fluid" onClick={() => setEditMode(true)}>
                          <i className="icon fas fa-plus" />
                          새로운 공지사항 만들기
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="vstack">
                    <label className="input-field">
                      제목
                      <input type="text" value={draftTitle} onChange={e => setDraftTitle(e.target.value)} />
                    </label>
                    <label className="input-field">
                      내용
                      <textarea className="input-field" value={draftBody} rows={10} onChange={e => setDraftBody(e.target.value)}/>
                    </label>
                    <div className="hstack" style={{justifyContent: 'flex-end'}}>
                      <button className="btn primary" onClick={submitAnnouncement} disabled={!draftTitle || !draftBody}>
                        완료
                      </button>
                      <button className="btn" onClick={() => {
                        selectAnnouncement(null);
                        setEditMode(false);
                      }}>
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <h2>노트왕 알림</h2>
            <div className="vstack">
              <button className="btn danger" onClick={onClickStartMisshaiAlertWorkerButton}>
                Misskey Tools 알림을 지금 전송하기
              </button>
              <h3>최근 알림 프로세스의 기록</h3>
              {misshaiLog && <LogView log={misshaiLog} />}
            </div>
          </>
        )
      }
    </div>
  );
};
