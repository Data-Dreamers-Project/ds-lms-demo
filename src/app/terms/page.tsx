import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-extrabold mb-4">利用規約</h1>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        <Card className="space-y-4 p-6">
          {/* 第1条 */}
          <CardHeader>
            <CardTitle className="text-xl">第1条（適用）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              本規約は、ユーザーと当プロジェクトとの間の本サービスの利用に関わる一切の関係に適用されるものとします。
            </p>
            <p>
              当プロジェクトは本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下、「個別規定」といいます。）をすることがあります。これら個別規定はその名称の如何に関わらず、本規約の一部を構成します。
            </p>
            <p>本規約の規定が個別規定の規定と矛盾する場合には、特段の定めがない限り、個別規定が優先されます。</p>
          </CardContent>
          <Separator />

          {/* 第2条 */}
          <CardHeader>
            <CardTitle className="text-xl">第2条（利用登録）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              登録希望者が本規約に同意の上、当プロジェクトの定める方法で利用登録を申請し、承認されることで完了します。
            </p>
            <p>以下の場合、当プロジェクトは利用登録を承認しないことがあります：</p>
            <ul className="list-disc list-inside">
              <li>申請に虚偽の事項を届け出た場合</li>
              <li>本規約に違反したことがある者からの申請の場合</li>
              <li>その他、当プロジェクトが登録を相当でないと判断した場合</li>
            </ul>
          </CardContent>
          <Separator />

          {/* 第3条 */}
          <CardHeader>
            <CardTitle className="text-xl">第3条（メールアドレスおよびパスワードの管理）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>ユーザーは自己の責任でメールアドレスおよびパスワードを適切に管理します。</p>
            <p>
              メールアドレスが第三者に使用されたことによる損害は、当プロジェクトに故意または重大な過失がある場合を除き、一切責任を負いません。
            </p>
          </CardContent>
          <Separator />

          {/* 第4条 */}
          <CardHeader>
            <CardTitle className="text-xl">第4条（禁止事項）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>ユーザーは以下の行為を行ってはなりません：</p>
            <ul className="list-disc list-inside">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>知的財産権を侵害する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>その他、当プロジェクトが不適切と判断する行為</li>
            </ul>
          </CardContent>
          <Separator />

          {/* 第5条 */}
          <CardHeader>
            <CardTitle className="text-xl">第5条（本サービスの提供の停止等）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              当プロジェクトは必要と判断した場合、事前通知なく本サービスを停止または中断できます。停止・中断による損害については責任を負いません。
            </p>
          </CardContent>
          <Separator />

          {/* 第6条 */}
          <CardHeader>
            <CardTitle className="text-xl">第6条（利用制限および登録抹消）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>以下の場合、当プロジェクトは利用制限または登録抹消を行うことがあります：</p>
            <ul className="list-disc list-inside">
              <li>本規約に違反した場合</li>
              <li>その他、当プロジェクトが適当でないと判断した場合</li>
            </ul>
            <p>これによる損害については一切責任を負いません。</p>
          </CardContent>
          <Separator />

          {/* 第7条 */}
          <CardHeader>
            <CardTitle className="text-xl">第7条（保証の否認および免責事項）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              当プロジェクトは本サービスに瑕疵がないことを保証しません。ユーザーに生じた損害について、故意または重大な過失がある場合を除き責任を負いません。
            </p>
          </CardContent>
          <Separator />

          {/* 第8条 */}
          <CardHeader>
            <CardTitle className="text-xl">第8条（サービス内容の変更等）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>当プロジェクトは事前告知のうえ、本サービス内容の変更または廃止ができます。</p>
          </CardContent>
          <Separator />

          {/* 第9条 */}
          <CardHeader>
            <CardTitle className="text-xl">第9条（利用規約の変更）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>当プロジェクトは本規約を合理的範囲で変更できます。変更後は事前に通知します。</p>
          </CardContent>
          <Separator />

          {/* 第10条 */}
          <CardHeader>
            <CardTitle className="text-xl">第10条（個人情報の取扱い）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>当プロジェクトは「プライバシーポリシー」に従い、個人情報を適切に取り扱います。</p>
          </CardContent>
          <Separator />

          {/* 第11条 */}
          <CardHeader>
            <CardTitle className="text-xl">第11条（通知または連絡）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>通知または連絡は当プロジェクトが定める方法で行います。</p>
          </CardContent>
          <Separator />

          {/* 第12条 */}
          <CardHeader>
            <CardTitle className="text-xl">第12条（権利義務の譲渡の禁止）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>ユーザーは当プロジェクトの承諾なく権利義務を第三者に譲渡できません。</p>
          </CardContent>
          <Separator />

          {/* 第13条 */}
          <CardHeader>
            <CardTitle className="text-xl">第13条（準拠法・裁判管轄）</CardTitle>
          </CardHeader>
          <CardContent>
            <p>本規約の解釈には日本法を準拠法とし、解釈されるものとします。</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
