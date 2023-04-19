import { useAtom, useAtomValue } from 'jotai';
import React, { PropsWithChildren, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { NavigationMenu } from '../components/NavigationMenu';
import { SuspenseView } from '../components/SuspenseView';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Loading } from '../Loading';
import { IsMobileProp } from '../misc/is-mobile-prop';

import { metaAtom } from '../store/api/meta';
import { sessionAtom } from '../store/api/session';
import { isDrawerShownAtom, isMobileAtom, titleAtom } from '../store/client-state';

const Container = styled.div<IsMobileProp>`
	padding: var(--margin);
	position: relative;
`;

const Sidebar = styled.nav`
	width: 320px;
	position: fixed;
	top: var(--margin);
	left: var(--margin);
`;

const Main = styled.main<IsMobileProp>`
	flex: 1;
  margin-top: 80px;
	margin-left: ${p => !p.isMobile ? `${320 + 16}px` : 0};
	min-width: 0;
`;

const MobileHeader = styled.header`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 64px;
	background: var(--panel);
	z-index: 1000;
	> h1 {
		font-size: 1rem;
		margin-bottom: 0;
	}
`;

export const GeneralLayout: React.FC<PropsWithChildren> = ({children}) => {
	const meta = useAtomValue(metaAtom);
	const session = useAtomValue(sessionAtom);
	const isMobile = useAtomValue(isMobileAtom);
	const title = useAtomValue(titleAtom);
	const [isDrawerShown, setDrawerShown] = useAtom(isDrawerShownAtom);
  const {t} = useTranslation();

  return (
    <Container isMobile={isMobile}>
      {isMobile && (
        <MobileHeader className="navbar hstack f-middle shadow-2 pl-2">
          <button className="btn flat" onClick={() => setDrawerShown(!isDrawerShown)}>
            <i className="fas fa-bars"></i>
          </button>
          <h1>{t(title ?? 'title')}</h1>
        </MobileHeader>
      )}
      <div>
        {!isMobile && (
          <Sidebar className="pa-2">
            <NavigationMenu />
          </Sidebar>
        )}
        <Main isMobile={isMobile}>
          {session && meta && meta.currentTokenVersion !== session.tokenVersion && (
            <div className="alert bg-danger flex f-middle mb-2">
              <i className="icon fas fa-circle-exclamation"></i>
              {t('shouldUpdateToken')}
              <a className="btn primary" href={`/login?host=${encodeURIComponent(session.host)}`}>
                {t('update')}
              </a>
            </div>
          )}
					<SuspenseView>{children}</SuspenseView>
        </Main>
      </div>
      <div className={`drawer-container ${isDrawerShown ? 'active' : ''}`}>
        <div className="backdrop" onClick={() => setDrawerShown(false)}></div>
        <div className="drawer pa-2" onClick={e => e.stopPropagation()}>
          <NavigationMenu />
        </div>
      </div>
    </Container>
  );
};