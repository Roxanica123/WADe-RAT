

class Headers {
    Authorization!: string
};


export class MatchReasponse{
    
    body!: any;
    headers!: Headers;
    method!: string;
    url!: string;
}

export class NoMatchReasponse{
    suggestions!: string[];
}