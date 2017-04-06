import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HttpService } from './http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
// 初期化完了通知のためにngOnInit()を実装
export class AppComponent implements OnInit {

  // app.component.htmlに渡す情報
  tourObj; //選択したツアー情報(１件分）
  selectedData; //選択したエリアのツアー情報
  bookmarks; //ブックマーク
  isMobile = false; //PCとモバイルの判定
  MOBILE_SCREEN_WIDTH = 768; //モバイル判定画面幅
  isCollapsed = false;
  areas = [ //３エリアの全データ
    {code: "BCH", name: "ビーチリゾート", data: null},
    {code: "EUR", name: "ヨーロッパ", data: null},
    {code: "DUS", name: "アメリカ", data: null},
    {code: "BOOKMARK", name: "お気に入り", data: null},
  ];

  // HttpServiceのDI
  public constructor(private httpService: HttpService,) {}

  // アプリ起動時の処理
  ngOnInit() {
    //クラウドからツアー情報取得
    this.getTour();
    // 保存したブックマークを取得
    this.initBookmarks();
  }

  // ブックマークを取得するメソッド
  initBookmarks(){
    let storeData = localStorage.getItem("bookmark");
    if (storeData) {
      this.bookmarks = JSON.parse(storeData);
    } else {
      this.bookmarks = {};
    }
  }

  //エリアメニュー選択をクリックした時のメソッド
  onAreaChange(index) {
    let area = this.areas[index];
    //ブックマーク選択時
    if (area.code === "BOOKMARK") {
      if (Object.keys(this.bookmarks).length === 0) {
        alert("ブックマークが登録されていません");
        return;
      }
      this.selectedData = Object.keys(this.bookmarks).map(key => this.bookmarks[key]);
    } else {
      //エリア名選択時
      this.selectedData = area.data.data;
    }
    //スクロール位置をリセット(一部のブラウザはタイマーから呼び出しが必要）
    setTimeout(scroll(0, 0), 1);
  }

  //ブックマークボタンのクリック時
  onBookmarkClick(tourID, index) {
    //登録が無い場合はブックマーク情報に追加
    if (!this.isMarked(tourID)) {
      //登録件数の確認
      if (Object.keys(this.bookmarks).length === 10) {
        return alert("Bookmarkは最大10件です");
      }
      //登録
      this.bookmarks[tourID] = this.selectedData[index];
    } else {
      //登録済みの場合はブックマーク情報から削除
      delete this.bookmarks[tourID];
    }
    //更新されたブックマーク情報の保存
    localStorage.setItem(
        "bookmarks", JSON.stringify(this.bookmarks));
  }

  //ブックマーク登録済み確認
  isMarked(tourID) {
    return this.bookmarks[tourID];
  }

  //3エリアのツアー情報を一括受信するメソッド
  getTour() {
    this.selectedData = null;
    for (let i = 0; i < this.areas.length; i++) {
      let areaCode = this.areas[i].code;
      if (areaCode === "BOOKMARK") { //お気に入りはローカル保存のため受信不要
        continue;
      }
      this.httpService.getTourData(areaCode).subscribe(
        result => this.setTour(result, i), //通信成功時の処理
        error => alert("通信エラー\n" + error) //通信失敗時の処理
      );
    }
  }

  //受信データの表示をするメソッド
  setTour(result, i) {
    //Web APIデータ取得エラー発生時
    if (result.error) {
      alert("Web APIエラー\n" + result.message);
      return;
    }
    //Web APIデータ取得成功時
    this.areas[i].data = result;
  }
}
