interface WXApiOption {
  success?(res: any): void;
  fail?(err: object): void;
  complete?(res: any): void;
}

interface ShowToastOption extends WXApiOption {
  title: string;
  icon?: string;
  image?: string;
  duration?: number;
  mask?: boolean;
}

interface ShowLoadingOption extends WXApiOption {
  title: string;
  mask?: boolean;
}

interface ShowModalOption extends WXApiOption {
  title: string;
  content: string;
  showCancel?: boolean;
  cancelText?: string;
  cancelColor?: string;
  confirmText?: string;
  confirmColor?: string;
}

interface ShowActionSheetOption extends WXApiOption {
  itemList: string[];
  itemColor?: string;
}

interface GetLocationOption extends WXApiOption {
  type?: string;
  altitude?: boolean;
}

interface OpenLocationOption extends WXApiOption {
  latitude: number;
  longitude: number;
  scale?: number;
  name?: string;
  address?: string;
}

interface ChooseImageOption extends WXApiOption {
  count: number;
  sizeType?: string[];
  sourceType?: string[];
}

interface PreviewImageOption extends WXApiOption {
  urls: string[];
  current?: string;
}

interface MakePhoneCallOption extends WXApiOption {
  phoneNumber: string;
}

declare namespace wx {
  export function showToast(option: ShowToastOption): void;
  export function hideToast(): void;
  export function showLoading(option: ShowLoadingOption): void;
  export function hideLoading(): void;
  export function showModal(option: ShowModalOption): void;
  export function showActionSheet(option: ShowActionSheetOption): void;

  export function getLocation(option: GetLocationOption): void;
  export function chooseLocation(option: WXApiOption): void;
  export function openLocation(option: OpenLocationOption): void;

  export function chooseImage(option: ChooseImageOption): void;
  export function previewImage(option: PreviewImageOption): void;

  export function makePhoneCall(option: MakePhoneCallOption): void;

  export function startPullDownRefresh(option: WXApiOption): void;
  export function stopPullDownRefresh(option: WXApiOption): void;
}