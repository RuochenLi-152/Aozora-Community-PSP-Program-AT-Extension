import React, {useState} from 'react';
import { Box, Text, Button } from '@airtable/blocks/ui';

export function InstructionsPage({ onNavigate }) {
    const [isJap, SetisJap] = useState(false);
    const changeLan = () => SetisJap(!isJap);

    return (
        <Box padding={4} position={'relative'}>
            <Button marginBottom={4} onClick={() => onNavigate('home')}>
                ← Back
            </Button>


            <Box display={"flex"} justifyContent={'flex-end'} marginBottom={3}>
                <Button
                    variant="default"
                    onClick={changeLan}
                >
                    {isJap ? 'English' : '日本語'}
                </Button>
            </Box>

            <Text fontSize={5} fontWeight="bold" marginBottom={3}>
                {isJap ? 'この拡張機能の使い方' : 'How to Use This Extension?'}    
            </Text>

            {!isJap? (
                <>
                <Text marginBottom={2}>
                    1. Download the csv file from Enrollsy, under "Students" tab with proper view
                </Text>

                <Text marginBottom={2}>
                    2. Click into "Add Students" page, drag or drop the csv file into the box to automatically detect and create new students that are not recorded. 
                    Records are stored in the "Student Basic Info" table
                </Text>

                <Text marginBottom={2}>
                    3. Click into "Update Schedule" page, drag or drop the csv file into the box to automatically detect and update students' schedule change from the uploaded file.
                    Records are stored in the "All Participants with Weeks" & "Participants by Week" table
                </Text>
                <Text marginBottom={2}>
                    4. After finish, a summary will be generated under the upload box, from where you can check if the records have been updated/added as expected.
                </Text>
                <Text marginBottom={4} fontWeight={'bold'}>
                If you encounter any errors or unexpected behavior, please note that some field and table names in this extension are hard-coded for ease of use. Feel free to ask me or send an email for support or customization.
                </Text>
                </>
            ) : (
                <>
                    <Text marginBottom={2}>1. Enrollsy の「Students」タブから適切なビューでCSVをダウンロードしてください。</Text>
                    <Text marginBottom={2}>2. 「Add Students」ページに移動し、CSVファイルをアップロードします。新しい学生情報が「Student Basic Info」テーブルに自動追加されます。</Text>
                    <Text marginBottom={2}>3. 「Update Schedule」ページに移動し、CSVファイルをアップロードするとスケジュールが更新されます。対象テーブル:「All Participants with Weeks」「Participants by Week」</Text>
                    <Text marginBottom={2}>4. 完了後、アップロードボックスの下に更新内容のサマリーが表示されます。</Text>
                    <Text marginBottom={2} fontWeight={'bold'}>
                        この拡張機能は使いやすさのために一部のフィールドやテーブル名がハードコードされています。問題が発生した場合はお気軽にご相談ください。
                    </Text>
                </>
            )}

            <Box
                position="absolute"
                bottom={2}
                right={2}
                zIndex={1}
            >
                <Text fontSize={1} style={{color: "#cccccc"}}>
                    Created by Ruochen Li, 2025
                </Text>
            </Box>
        </Box>
    );
}
