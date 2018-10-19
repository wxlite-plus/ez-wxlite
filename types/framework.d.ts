interface AppOption {
  onLaunch?(option: object): void;
  onShow?(): void;
  onHide?(): void;
  onError?(): void;
  onPageNotFound?(): void;
}

interface ShareOption {
  from: string;
  target: object;
  webViewUrl: string;
}

interface ShareObject {
  title?: string;
  path?: string;
  imageUrl?: string;
}

interface PageOption {
  data?: object;
  onLoad?(option: object): void;
  onReady?(): void;
  onShow?(): void;
  onHide?(): void;
  onUnload?(): void;
  onPullDownRefresh?(): void;
  onReachBottom?(): void;
  onShareAppMessage?(option: ShareOption): ShareObject;
  onTabItemTap?(): void;
}

interface ComponentOption {
  properties?: object;
  data?: object;
  methods?: object;
  behaviors?: string[];
  created?(): void;
  attached?(): void;
  ready?(): void;
  moved?(): void;
  detached?(): void;
  relations?: object;
  externalClasses?: string[];
  options?: object;
  lifetimes?: object;
  pageLifetimes?: object;
  definitionFilter?(): void;
}

declare function App(option: AppOption): void;
declare function Page(option: PageOption): void;
declare function Component(option: ComponentOption): void;