# WADe-RAT

## Midterm Deliverables
- The architectural diagrams, OpenAPI documents, technical report and user guide can be seen in the /docs folder. 
- Our blog is here: https://roxanica123.github.io/WADe-RAT/ 
- The updated scholary document can be found here : https://roxanica123.github.io/WADe-RAT/docs/
- The user guide and case studies can be found here: https://roxanica123.github.io/WADe-RAT/guide/
- The presentation video : https://www.youtube.com/watch?v=NYiplORjExA
- Our application is deployed and can be used here:  https://rat-ui.azurewebsites.net/ catch it while you can
- If our UI is not your cup of tea you can send a POST request directly to our API : 
  - Gateway Azure Function: https://rat-gateway.azurewebsites.net/api/process 
  - Payload example: 
```
{
    "openApiDocumentUrl": "https://api.apis.guru/v2/specs/googleapis.com/youtube/v3/openapi.json",
    "sentence": "Delete the caption with the identifier 3.",
    "language": "English"
    (optional) "path": "/youtube/v3/captions"
}
```
