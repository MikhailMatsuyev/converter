import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Firebase ID token from frontend',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlZDI5MWRiYjA4YTQ5M2UxNDFhY2M4MDFiMjhkMDUxMjFhMWI4M2IifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWktZmlsZS1wcm9jZXNzb3IiLCJhdWQiOiJhaS1maWxlLXByb2Nlc3NvciIsImF1dGhfdGltZSI6MTczOTI5MDEwNSwidXNlcl9pZCI6Ikp3VUJjRXBzQjNjdjVyM3pJMDQ3TlE0V21LMnMiLCJzdWIiOiJKd1VCY0Vwc0IzY3Y1cjN6STAwN05RNFdtSzJzIiwiaWF0IjoxNzM5MjkwMTA1LCJleHAiOjE3MzkyOTM3MDUsImVtYWlsIjoiZXhhbXBsZUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJleGFtcGxlQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.ABC123...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}