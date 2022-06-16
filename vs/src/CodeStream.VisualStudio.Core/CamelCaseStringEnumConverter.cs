using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace CodeStream.VisualStudio.Core
{
    public class CamelCaseStringEnumConverter : StringEnumConverter
    {
        public CamelCaseStringEnumConverter() {
	        NamingStrategy = new CamelCaseNamingStrategy();
        }
    }
}
